const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
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

// =================== DES DECRYPTION (JioSaavn encrypted_media_url) ===================
// JioSaavn encrypts the actual download URL using DES-ECB with a known key
const JIOSAAVN_DES_KEY = '38346591';

function decryptMediaUrl(encryptedUrl) {
    try {
        const key = Buffer.from(JIOSAAVN_DES_KEY);
        const encrypted = Buffer.from(encryptedUrl, 'base64');
        const decipher = crypto.createDecipheriv('des-ecb', key, null);
        decipher.setAutoPadding(true);
        let decrypted = decipher.update(encrypted, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        // The decrypted URL is the actual CDN link, upgrade to 320kbps
        return decrypted.replace('_96.mp4', '_320.mp4')
                        .replace('_160.mp4', '_320.mp4')
                        .replace('_128.mp4', '_320.mp4');
    } catch (e) {
        console.error('DES Decryption failed:', e.message);
        return null;
    }
}

// =================== HTTP HELPERS ===================

// Helper to make HTTPS/HTTP GET requests with JSON response
const fetchJson = (url, timeoutMs = 8000) => {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const options = {
            timeout: timeoutMs,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
            }
        };

        lib.get(url, options, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchJson(res.headers.location, timeoutMs).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('JSON parse error')); }
            });
        }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
    });
};

// Helper to make JioSaavn API calls
const jiosaavnRequest = (params, version = '4') => {
    return new Promise((resolve, reject) => {
        const searchParams = {
            ...params,
            _format: 'json',
            _marker: '0',
            cc: 'in',
            api_version: version,
            ctx: version === '4' ? 'wap6dot0' : 'web'
        };
        const queryString = new URLSearchParams(searchParams).toString();
        const url = `${JIOSAAVN_BASE}?${queryString}`;

        const options = {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
                'Referer': 'https://www.jiosaavn.com/',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            }
        };

        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                console.warn(`🛑 JioSaavn returned ${res.statusCode} for ${url.substring(0, 100)}`);
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    console.error(`❌ Parse error (${res.statusCode}) for URL: ${url.substring(0, 100)}...`);
                    // If it's a 403/404, the data might be HTML
                    if (data.includes('<html')) {
                        console.error('HTML received instead of JSON. Likely blocked or captcha.');
                    }
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

// =================== RESOLVE FULL SONG URL ===================
// This is the core function that resolves a full-length HQ URL from a song ID

// In-memory cache for resolved HQ URLs (songId -> url)
const hqUrlCache = new Map();

async function resolveFullSongUrl(songId, songName = null, songArtist = null) {
    // Check cache first
    if (hqUrlCache.has(songId)) {
        console.log(`🎵 Cache hit for song ${songId}`);
        return hqUrlCache.get(songId);
    }

    console.log(`🔍 Resolving full URL for: ${songName || songId}`);

    console.log("--- STRATEGY 1 START ---");
    // STRATEGY 1: Use JioSaavn's own song.getDetails API to get encrypted_media_url
    try {
        // v3 is MUST for encrypted_media_url
        const songData = await jiosaavnRequest({
            __call: 'song.getDetails',
            pids: songId,
        }, '3');
        
        console.log(`📡 Strategy 1: Data keys for ${songId}: ${Object.keys(songData)}`);
        
        let songInfo = null;
        if (songData[songId]) {
            songInfo = songData[songId];
        } else if (songData.songs && Array.isArray(songData.songs)) {
            songInfo = songData.songs.find(s => s.id === songId) || songData.songs[0];
        } else {
            // Try to find the song in any object value
            songInfo = Object.values(songData).find(v => v && typeof v === 'object' && v.id === songId) 
                      || Object.values(songData).find(v => v && typeof v === 'object' && v.id);
        }

        if (songInfo) {
            // In v3, the encrypted_media_url is usually in more_info or direct
            const encUrl = songInfo.encrypted_media_url || songInfo.more_info?.encrypted_media_url;
            if (encUrl) {
                console.log(`🔑 Found encrypted_media_url for ${songId}, decrypting...`);
                const decrypted = decryptMediaUrl(encUrl);
                if (decrypted) {
                    console.log(`✅ Strategy 1 (DES decrypt) SUCCESS for ${songId}`);
                    console.log(`🔗 Decrypted URL: ${decrypted.substring(0, 80)}...`);
                    hqUrlCache.set(songId, decrypted);
                    return decrypted;
                }
            } else {
                console.warn(`⚠️ No encrypted_media_url found in song data for ${songId}`);
            }
        } else {
            console.warn(`⚠️ Could not extract song info from response for ${songId}`);
        }
    } catch (e) {
        console.warn(`⚠️ Strategy 1 failed for ${songId}:`, e.message);
    }

    // STRATEGY 2: Use third-party JioSaavn API instances
    const thirdPartyApis = [
        `https://saavn.dev/api/songs/${songId}`,
        `https://jiosaavn-api-privatecvc2.vercel.app/api/songs/${songId}`,
        `https://jiosaavn-api-ashutosh.vercel.app/api/songs?id=${songId}`,
        `https://jiosaavn-api-liard.vercel.app/api/songs?id=${songId}`,
    ];

    for (const api of thirdPartyApis) {
        try {
            const hqData = await fetchJson(api, 5000);

            // Handle different response structures
            let song = null;
            if (hqData.data && Array.isArray(hqData.data)) {
                song = hqData.data[0];
            } else if (hqData.data && hqData.data.id) {
                song = hqData.data;
            } else if (Array.isArray(hqData)) {
                song = hqData[0];
            }

            if (song) {
                // Try downloadUrl array (most common)
                let downloadUrls = song.downloadUrl || song.download_url || song.downloadLinks;
                if (downloadUrls && Array.isArray(downloadUrls)) {
                    // Get highest quality (last item or look for 320kbps)
                    const hq = downloadUrls.find(d => d.quality === '320kbps' || d.quality === '320') 
                            || downloadUrls[downloadUrls.length - 1];
                    const link = hq?.link || hq?.url || (typeof hq === 'string' ? hq : null);
                    if (link) {
                        console.log(`✅ Strategy 2 (${api}) SUCCESS for ${songId}`);
                        hqUrlCache.set(songId, link);
                        return link;
                    }
                }

                // Try direct URL field
                if (song.url && typeof song.url === 'string' && song.url.includes('saavncdn')) {
                    console.log(`✅ Strategy 2 (${api}) SUCCESS via direct URL for ${songId}`);
                    hqUrlCache.set(songId, song.url);
                    return song.url;
                }
            }
        } catch (e) {
            // Try next API
        }
    }

    // STRATEGY 4: Search fallback (if we have name/artist)
    if (songName) {
        try {
            console.log(`🔎 Strategy 4 (Search Fallback) for: ${songName}`);
            const query = `${songName} ${songArtist || ''}`.trim();
            const searchData = await jiosaavnRequest({
                __call: 'search.getResults',
                q: query,
                n: '1',
            });
            if (searchData.results?.[0]) {
                const s = searchData.results[0];
                const encUrl = s.encrypted_media_url || s.more_info?.encrypted_media_url;
                if (encUrl) {
                    const decrypted = decryptMediaUrl(encUrl);
                    if (decrypted) {
                        console.log(`✅ Strategy 4 SUCCESS for ${songName}`);
                        hqUrlCache.set(songId, decrypted);
                        return decrypted;
                    }
                }
            }
        } catch (e) {
            console.warn(`⚠️ Strategy 4 failed:`, e.message);
        }
    }

    console.error(`❌ All strategies failed for song ${songId} (${songName})`);
    return null;
}

// =================== SONG FORMATTING ===================

const formatSong = (song) => {
    const info = song.more_info || {};
    const songId = song.id;

    // Always route through our stream proxy with the song ID
    // The proxy will resolve the full HQ URL on-the-fly
    // Pass name and artist for better fallback resolution
    const name = song.song || song.title || song.name || 'Unknown Track';
    const artist = song.primary_artists || song.singers || song.subtitle || info.artistMap?.primary_artists?.[0]?.name || 'Unknown Artist';
    
    // Use environment variable for the base URL, or fallback to localhost if not set
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const preview = songId ? `${baseUrl}/api/stream?id=${songId}&name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}` : '';


    return {
        id: songId,
        name: name,
        artist: artist,
        artistId: song.primary_artists_id?.split(', ')[0] || info.artistMap?.primary_artists?.[0]?.id || '',
        image: hdImage(song.image || info.image),
        preview_url: preview,
        duration_ms: (parseInt(song.duration || info.duration) || 0) * 1000,
        album: song.album || info.album || '',
        playCount: song.play_count || info.play_count || '0',
    };
};

// ========================== ENDPOINTS ==========================

// Audio Stream Proxy — resolves full HQ URL and streams it
app.get('/api/stream', async (req, res) => {
    let { url, id, name, artist } = req.query;

    if (!id && !url) return res.status(400).send('Song ID or URL is required');

    // If we have a song ID, resolve the full HQ URL
    if (id) {
        const resolvedUrl = await resolveFullSongUrl(id, name, artist);
        if (resolvedUrl) {
            url = resolvedUrl;
        } else if (url) {
            // Fallback: try to upgrade preview URL manually
            if (url.includes('preview.saavncdn.com')) {
                url = url.replace(/preview\.saavncdn\.com/, 'aac.saavncdn.com')
                         .replace(/_p\.(mp4|aac|m4a|mp3)/, '_320.mp4');
            }
        } else {
            console.warn(`🛑 Giving up on stream for ${name || id}`);
            return res.status(404).send('Could not resolve song URL');
        }
    }

    // Stream the audio
    const lib = url.startsWith('https') ? https : http;
    const streamOptions = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.jiosaavn.com/',
            'Accept': 'audio/mpeg, audio/wav, audio/aac, audio/ogg, audio/*;q=0.9, */*;q=0.5',
        }
    };

    // Forward range headers for seeking support
    if (req.headers.range) {
        streamOptions.headers['Range'] = req.headers.range;
    }

    const doStream = (streamUrl, redirectCount = 0) => {
        if (redirectCount > 5) {
            return res.status(502).send('Too many redirects');
        }

        const streamLib = streamUrl.startsWith('https') ? https : http;
        streamLib.get(streamUrl, streamOptions, (proxyRes) => {
            // Handle redirects
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
                return doStream(proxyRes.headers.location, redirectCount + 1);
            }

            // Set proper headers for audio streaming
            const headers = {
                'Content-Type': proxyRes.headers['content-type'] || 'audio/mp4',
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
            };
            if (proxyRes.headers['content-length']) {
                headers['Content-Length'] = proxyRes.headers['content-length'];
            }
            if (proxyRes.headers['content-range']) {
                headers['Content-Range'] = proxyRes.headers['content-range'];
            }

            res.writeHead(proxyRes.statusCode, headers);
            proxyRes.pipe(res);
        }).on('error', (err) => {
            console.error('Proxy stream error:', err.message);
            if (!res.headersSent) {
                res.status(500).send('Stream failed');
            }
        });
    };

    doStream(url);
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

// Get album details with tracks
app.get('/api/album/:id', async (req, res) => {
    const albumId = req.params.id;
    try {
        console.log(`📀 Fetching album: ${albumId}`);
        const data = await jiosaavnRequest({
            __call: 'content.getAlbumDetails',
            albumid: albumId,
        });

        const albumInfo = {
            id: data.albumid || data.id || albumId,
            name: data.title || data.name || 'Unknown Album',
            artist: data.primary_artists || data.music || data.subtitle || '',
            image: hdImage(data.image || ''),
        };

        const tracks = (data.songs || data.list || []).map(formatSong);

        res.json({ album: albumInfo, tracks });
    } catch (err) {
        console.error('Album tracks error:', err.message);
        res.status(500).json({ error: 'Failed to fetch album tracks' });
    }
});

// In-memory artist cache to avoid spamming the API on every request/restart
let globalArtistsCache = null;

// Get popular artists
app.get('/api/artists', async (req, res) => {
    if (globalArtistsCache) return res.json(globalArtistsCache);
    
    try {
        const artistNames = [
            // 90s Legends (The User's Request)
            'Kumar Sanu', 'Alka Yagnik', 'Udit Narayan', 'Sonu Nigam', 'Kavita Krishnamurthy',
            'Abhijeet Bhattacharya', 'Anu Malik', 'Hariharan', 'Sadhana Sargam', 'Shaan',
            
            // Modern Superstars
            'Arijit Singh', 'Atif Aslam', 'Shreya Ghoshal', 'Jubin Nautiyal', 'Neha Kakkar', 
            'Diljit Dosanjh', 'Armaan Malik', 'B Praak', 'Darshan Raval', 'Mohit Chauhan',
            
            // Rap & Hip-Hop
            'Sidhu Moose Wala', 'Badshah', 'Yo Yo Honey Singh', 'Divine', 'MC Stan', 
            'King', 'AP Dhillon', 'Raftaar', 'Emiway Bantai', 'Krsna',
            
            // South Indian / Pan-India
            'Anirudh Ravichander', 'Sid Sriram', 'AR Rahman', 'Devi Sri Prasad',
            
            // All-Time Classics
            'Kishore Kumar', 'Lata Mangeshkar', 'Mohammed Rafi', 'Mukesh', 'Asha Bhosle',
            'Jagjit Singh', 'Pankaj Udhas', 'Nusrat Fateh Ali Khan',
            
            // Pop & Indie
            'Sachet-Parampara', 'Tony Kakkar', 'Mithoon', 'Pritam', 'Vishal-Shekhar',
            'Lucky Ali', 'Sunidhi Chauhan', 'Adnan Sami', 'Himesh Reshammiya'
        ];

        // Unique names only
        const uniqueArtists = [...new Set(artistNames)];
        
        // Fetch sequential/batched to avoid rate limits
        const artists = [];
        const batchSize = 3; // Even smaller batch to be safe
        
        console.log(`🎨 Fetching ${uniqueArtists.length} artists...`);
        
        for (let i = 0; i < uniqueArtists.length; i += batchSize) {
            const batch = uniqueArtists.slice(i, i + batchSize);
            const batchPromises = batch.map(name =>
                jiosaavnRequest({
                    __call: 'search.getArtistResults',
                    q: name,
                    n: '1',
                }).catch(() => null)
            );
            
            const results = await Promise.all(batchPromises);
            results.forEach(r => {
                if (r && r.results?.[0]) {
                    const artist = r.results[0];
                    if (artist.image && !artist.image.includes('artist-default')) {
                        artists.push({
                            id: artist.id,
                            name: artist.name,
                            image: hdImage(artist.image),
                        });
                    }
                }
            });
            
            // Small gap between batches to breathe
            if (i + batchSize < uniqueArtists.length) {
                await new Promise(r => setTimeout(r, 400));
            }
        }

        globalArtistsCache = artists;
        res.json(artists);
    } catch (err) {
        console.error('Artists error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artists', details: err.message });
    }
});

// Get artist details with their top songs
app.get('/api/artist/:id/tracks', async (req, res) => {
    const id = req.params.id;
    try {
        let artistInfo = null;
        let topSongs = [];

        // STRATEGY 1: If ID is numerical, try getting direct artist details
        if (/^\d+$/.test(id)) {
            try {
                console.log(`👤 Fetching artist details by ID: ${id}`);
                const artistData = await jiosaavnRequest({
                    __call: 'artist.getArtistPageDetails',
                    artistId: id,
                    n_song: '50',
                    n_album: '0',
                });

                if (artistData.name) {
                    artistInfo = {
                        id: artistData.artistId || id,
                        name: artistData.name,
                        image: hdImage(artistData.image),
                    };
                    topSongs = (artistData.topSongs || []).map(formatSong);
                }
            } catch (e) {
                console.error(`Artist ID fetch failed for ${id}:`, e.message);
            }
        }

        // STRATEGY 2: If no data yet, try searching for the artist
        if (!artistInfo || topSongs.length === 0) {
            console.log(`🔍 Searching for artist as name/query: ${id}`);
            const searchData = await jiosaavnRequest({
                __call: 'search.getArtistResults',
                q: id,
                n: '1',
            });

            artistInfo = searchData.results?.[0];
            
            if (artistInfo?.perma_url) {
                const token = artistInfo.perma_url.split('/').pop();
                try {
                    const artistData = await jiosaavnRequest({
                        __call: 'webapi.get',
                        token: token,
                        type: 'artist',
                        n_song: '50',
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
        }

        // STRATEGY 3: Final fallback - search for songs by artist name
        if (topSongs.length === 0) {
            const songsData = await jiosaavnRequest({
                __call: 'search.getResults',
                q: artistInfo?.name || id,
                n: '30',
            });
            topSongs = (songsData.results || []).map(formatSong);
        }

        res.json({
            artist: {
                id: artistInfo?.id || id,
                name: artistInfo?.name || id,
                image: hdImage(artistInfo?.image || ''),
            },
            tracks: topSongs,
        });
    } catch (err) {
        console.error('Artist tracks error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artist tracks' });
    }
});

// Health check — also tests that full song resolution works
app.get('/api/health', async (req, res) => {
    try {
        const data = await jiosaavnRequest({
            __call: 'search.getResults',
            q: 'test',
            n: '1',
        });
        if (data.results?.length > 0) {
            const testSong = data.results[0];
            const resolvedUrl = await resolveFullSongUrl(testSong.id);
            res.json({
                status: 'ok',
                message: 'JioSaavn API is working!',
                fullSongResolution: resolvedUrl ? 'working ✅' : 'failed ❌',
                testSongId: testSong.id,
                resolvedUrl: resolvedUrl ? resolvedUrl.substring(0, 80) + '...' : null,
            });
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
    console.log(`✅ Full Song Playback Enabled (DES Decryption + Multi-API Fallback)`);
    console.log(`🎵 Audio Quality: 320kbps`);
});

server.on('error', (err) => {
    console.error('💥 Server Error:', err);
});

// Heartbeat to keep the process alive
setInterval(() => { }, 1000 * 60 * 60);

