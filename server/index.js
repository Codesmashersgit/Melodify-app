const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const JIOSAAVN_BASE = process.env.JIOSAAVN_API_URL || 'https://www.jiosaavn.com/api.php';

// Helper to make JioSaavn API calls
const jiosaavnRequest = (params) => {
    return new Promise((resolve, reject) => {
        // Essential params for better results and missing metadata
        const searchParams = {
            ...params,
            _format: 'json',
            _marker: '0',
            cc: 'in',
            api_version: '4',
            ctx: 'wap6dot0' // Mimicking mobile web for better data
        };
        const queryString = new URLSearchParams(searchParams).toString();
        const url = `${JIOSAAVN_BASE}?${queryString}`;

        const options = {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
                'Referer': 'https://www.jiosaavn.com/',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    console.error('Parse error for URL:', url);
                    reject(new Error('Failed to parse JioSaavn response'));
                }
            });
        }).on('error', (err) => {
            console.error('Request error:', err.message);
            reject(err);
        });
    });
};

// Helper to upgrade image quality (150x150 -> 500x500)
const hdImage = (url) => url ? url.replace(/150x150|50x50/, '500x500') : '';

// Helper to format a song object from JioSaavn response
const formatSong = (song) => {
    const info = song.more_info || {};
    const rawPreview = song.vlink || info.vlink || song.media_preview_url || info.media_preview_url || '';

    // Wrap the URL in our backend proxy. The proxy will handle HQ resolution.
    const preview = rawPreview ? `http://localhost:5000/api/stream?url=${encodeURIComponent(rawPreview)}&id=${song.id}` : '';

    return {
        id: song.id,
        name: song.song || song.title || song.name || 'Unknown Track',
        artist: song.primary_artists || song.singers || song.subtitle || info.artistMap?.primary_artists?.[0]?.name || 'Unknown Artist',
        artistId: song.primary_artists_id?.split(', ')[0] || info.artistMap?.primary_artists?.[0]?.id || '',
        image: hdImage(song.image || info.image),
        preview_url: preview,
        duration_ms: (parseInt(song.duration || info.duration) || 0) * 1000,
        album: song.album || info.album || '',
        playCount: song.play_count || info.play_count || '0',
    };
};

// ========================== ENDPOINTS ==========================

// Audio Stream Proxy (Bypasses 429 and CORS + Resolves High Quality)
app.get('/api/stream', async (req, res) => {
    let { url, id } = req.query;

    if (!url) return res.status(400).send('URL is required');

    // SMART RESOLVER: Use stable public instances for HQ 320kbps links
    if (id && (url.includes('preview.saavncdn.com') || url.includes('jiotunepreview.jio.com') || url === 'test')) {
        const fallbacks = [
            `https://jiosaavn-api-ashutosh.vercel.app/api/songs?id=${id}`,
            `https://jiosaavn-api-liard.vercel.app/api/songs?id=${id}`,
        ];

        for (const api of fallbacks) {
            try {
                const hqRes = await fetch(api, { signal: AbortSignal.timeout(4000) });
                const hqData = await hqRes.json();

                // Structure: hqData.data[0].downloadUrl
                const song = hqData.data?.[0] || hqData[0];
                if (song && song.downloadUrl) {
                    const downloadUrl = Array.isArray(song.downloadUrl) ? song.downloadUrl : [];
                    // Last index is usually 320kbps
                    const hqLink = downloadUrl[downloadUrl.length - 1]?.link || downloadUrl[downloadUrl.length - 1];
                    if (hqLink && typeof hqLink === 'string') {
                        url = hqLink;
                        break;
                    }
                }
            } catch (e) {
                // Ignore and try next
            }
        }
    }

    // Manual upgrade backup
    if (url.includes('preview.saavncdn.com')) {
        url = url.replace(/preview\.saavncdn\.com/, 'aac.saavncdn.com').replace(/_p\.(mp4|aac|m4a|mp3)/, '_320.mp4');
    }

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.jiosaavn.com/',
            'Accept': 'audio/mpeg, audio/wav, audio/aac, audio/ogg, audio/*;q=0.9, application/ogg;q=0.7, video/*;q=0.6, */*;q=0.5',
            'Range': req.headers.range || 'bytes=0-'
        }
    };

    https.get(url, options, (proxyRes) => {
        // Handle potential redirects from CDN
        if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
            return https.get(proxyRes.headers.location, options, (redirRes) => {
                res.set(redirRes.headers);
                res.status(redirRes.statusCode);
                redirRes.pipe(res);
            });
        }

        res.set(proxyRes.headers);
        res.status(proxyRes.statusCode);
        proxyRes.pipe(res);
    }).on('error', (err) => {
        console.error('Proxy stream error:', err.message);
        res.status(500).send('Stream failed');
    });
});

// Search songs
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    try {
        const data = await jiosaavnRequest({
            __call: 'search.getResults',
            q: query || 'Bollywood hits',
            n: '20',
        });
        const tracks = (data.results || []).map(formatSong);
        res.json(tracks);
    } catch (err) {
        console.error('Search error:', err.message);
        res.status(500).json({ error: 'Failed to search tracks', details: err.message });
    }
});

// Get trending/popular songs for home page (Top Hits)
app.get('/api/top-tracks', async (req, res) => {
    try {
        const data = await jiosaavnRequest({
            __call: 'search.getResults',
            q: 'top hindi songs 2024',
            n: '20',
        });
        const tracks = (data.results || []).map(formatSong);
        res.json(tracks);
    } catch (err) {
        console.error('Top tracks error:', err.message);
        res.status(500).json({ error: 'Failed to fetch top tracks', details: err.message });
    }
});

// Get new releases / albums for home page
app.get('/api/recommendations', async (req, res) => {
    try {
        const data = await jiosaavnRequest({
            __call: 'content.getHomepageData',
        });
        const albums = (data.new_albums || []).map(album => ({
            id: album.albumid || album.id,
            name: album.title || album.name,
            artist: album.music || album.subtitle || '',
            image: hdImage(album.image),
        }));
        res.json(albums.slice(0, 10));
    } catch (err) {
        console.error('Recommendations error:', err.message);
        res.status(500).json({ error: 'Failed to fetch recommendations', details: err.message });
    }
});

// Get popular artists
app.get('/api/artists', async (req, res) => {
    try {
        const artistNames = ['Arijit Singh', 'Atif Aslam', 'Shreya Ghoshal', 'Neha Kakkar', 'Jubin Nautiyal', 'Badshah', 'Honey Singh', 'AP Dhillon', 'Diljit Dosanjh', 'Armaan Malik'];
        const artistPromises = artistNames.map(name =>
            jiosaavnRequest({
                __call: 'search.getArtistResults',
                q: name,
                n: '1',
            }).catch(() => null)
        );

        const results = await Promise.all(artistPromises);
        const artists = results
            .filter(r => r && r.results?.[0])
            .map(r => r.results[0])
            .filter(a => a.image && !a.image.includes('artist-default'))
            .map(artist => ({
                id: artist.id,
                name: artist.name,
                image: hdImage(artist.image),
            }));

        res.json(artists);
    } catch (err) {
        console.error('Artists error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artists', details: err.message });
    }
});

// Get artist details with their top songs
app.get('/api/artist/:id/tracks', async (req, res) => {
    const query = req.params.id;
    try {
        // 1. Search for artist to get correct profile image and name
        const searchData = await jiosaavnRequest({
            __call: 'search.getArtistResults',
            q: query,
            n: '1',
        });

        let artistInfo = searchData.results?.[0];
        let topSongs = [];

        // 2. Try to get songs using artist token if available
        if (artistInfo?.perma_url) {
            const token = artistInfo.perma_url.split('/').pop();
            try {
                const artistData = await jiosaavnRequest({
                    __call: 'webapi.get',
                    token: token,
                    type: 'artist',
                    p: '1',
                    n_song: '30',
                    n_album: '0',
                });

                if (artistData.name) {
                    artistInfo = {
                        id: artistData.artistId || artistInfo.id,
                        name: artistData.name,
                        image: hdImage(artistData.image || artistInfo.image),
                    };
                    topSongs = (artistData.topSongs || []).map(formatSong);
                }
            } catch (e) {
                console.error('Artist token fetch failed');
            }
        }

        // 3. Fallback: Search for songs by artist name if no topSongs reached
        if (topSongs.length === 0) {
            const songsData = await jiosaavnRequest({
                __call: 'search.getResults',
                q: artistInfo?.name || query,
                n: '30',
            });
            topSongs = (songsData.results || []).map(formatSong);
        }

        res.json({
            artist: {
                id: artistInfo?.id || query,
                name: artistInfo?.name || query,
                image: hdImage(artistInfo?.image || ''),
            },
            tracks: topSongs,
        });
    } catch (err) {
        console.error('Artist tracks error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artist tracks' });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const data = await jiosaavnRequest({
            __call: 'search.getResults',
            q: 'test',
            n: '1',
        });
        if (data.results?.length > 0) {
            res.json({ status: 'ok', message: 'JioSaavn API is working!' });
        } else {
            res.status(500).json({ status: 'error', message: 'No results returned' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ High Quality Audio (320kbps) Enabled`);
});

server.on('error', (err) => {
    console.error('💥 Server Error:', err);
});

// Heartbeat to keep the process alive
setInterval(() => { }, 1000 * 60 * 60);

