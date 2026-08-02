const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const userRoutes = require('./routes');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
    'https://melodifynew.netlify.app'
].filter(Boolean);

app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }, 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
    exposedHeaders: ['Authorization']
}));
app.use(cookieParser());
app.use(express.json());

// =================== SECURITY ENHANCEMENTS ===================

// 1. Basic Security Headers (OWASP Mitigation)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; media-src 'self' data: https:; connect-src 'self' https:;");
    next();
});

// 2. Lightweight Rate Limiter for Auth Routes
const rateLimitStore = new Map();
const authRateLimiter = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const limitWindow = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // Max 100 requests per IP per window

    const clientHistory = rateLimitStore.get(ip) || [];
    // Filter out requests older than the limit window
    const activeRequests = clientHistory.filter(timestamp => now - timestamp < limitWindow);

    if (activeRequests.length >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests. Please try again after 15 minutes.' });
    }

    activeRequests.push(now);
    rateLimitStore.set(ip, activeRequests);
    next();
};

// Clean rateLimitStore periodically (every 1 hour) to save memory
setInterval(() => {
    const now = Date.now();
    const limitWindow = 15 * 60 * 1000;
    for (const [ip, history] of rateLimitStore.entries()) {
        const filtered = history.filter(timestamp => now - timestamp < limitWindow);
        if (filtered.length === 0) {
            rateLimitStore.delete(ip);
        } else {
            rateLimitStore.set(ip, filtered);
        }
    }
}, 60 * 60 * 1000);

// Apply rate limiting to all auth endpoints
app.use('/api/user/login', authRateLimiter);
app.use('/api/user/signup', authRateLimiter);
app.use('/api/user/forgot-password', authRateLimiter);
app.use('/api/user/reset-password', authRateLimiter);
app.use('/api/user/verify-otp', authRateLimiter);

// Prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const JIOSAAVN_BASE = process.env.JIOSAAVN_API_URL || 'https://www.jiosaavn.com/api.php';
let BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Dynamic BASE_URL middleware to support both localhost and production transparently
app.use((req, res, next) => {
    const host = req.headers.host || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        BASE_URL = `http://${host}`;
    } else {
        const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
        BASE_URL = `${protocol}://${host}`;
    }
    next();
});

// Mount User & DB routes
app.use('/api/user', userRoutes);

// =================== DES DECRYPTION (JioSaavn encrypted_media_url) ===================
// JioSaavn encrypts the actual download URL using DES-ECB with a known key
// Using pure-JS DES to avoid OpenSSL 3 "unsupported" error on Node.js v17+
const JIOSAAVN_DES_KEY = '38346591';

// ---- Pure JavaScript DES-ECB implementation (no OpenSSL dependency) ----
const DES_PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const DES_PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const DES_IP  = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const DES_IP2 = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const DES_E  = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const DES_P  = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const DES_SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
const DES_SBOXES = [
  [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
  [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
  [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
  [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
  [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
  [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
  [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
  [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
];

function desBitPerm(src, table, srcLen) {
    let dst = BigInt(0);
    const tLen = table.length;
    for (let i = 0; i < tLen; i++) {
        dst = (dst << BigInt(1)) | ((src >> BigInt(srcLen - table[i])) & BigInt(1));
    }
    return dst;
}

function desGenerateSubkeys(keyBuf) {
    let key56 = BigInt(0);
    for (let b of keyBuf) key56 = (key56 << BigInt(8)) | BigInt(b);
    let cd = desBitPerm(key56, DES_PC1, 64);
    let C = cd >> BigInt(28);
    let D = cd & BigInt(0xFFFFFFF);
    const subkeys = [];
    for (let i = 0; i < 16; i++) {
        const sh = DES_SHIFTS[i];
        C = ((C << BigInt(sh)) | (C >> BigInt(28 - sh))) & BigInt(0xFFFFFFF);
        D = ((D << BigInt(sh)) | (D >> BigInt(28 - sh))) & BigInt(0xFFFFFFF);
        subkeys.push(desBitPerm((C << BigInt(28)) | D, DES_PC2, 56));
    }
    return subkeys;
}

function desRound(block, subkeys) {
    let L = block >> BigInt(32);
    let R = block & BigInt(0xFFFFFFFF);
    for (let i = 0; i < 16; i++) {
        const E = desBitPerm(R, DES_E, 32);
        let xored = E ^ subkeys[i];
        let sOut = BigInt(0);
        for (let j = 0; j < 8; j++) {
            const chunk = Number((xored >> BigInt(42 - j * 6)) & BigInt(0x3F));
            const row = ((chunk & 0x20) >> 4) | (chunk & 0x01);
            const col = (chunk >> 1) & 0x0F;
            sOut = (sOut << BigInt(4)) | BigInt(DES_SBOXES[j][row * 16 + col]);
        }
        const P = desBitPerm(sOut, DES_P, 32);
        const newR = L ^ P;
        L = R;
        R = newR;
    }
    return desBitPerm((R << BigInt(32)) | L, DES_IP2, 64);
}

function desDecryptBlock(blockBuf, subkeys) {
    let block = BigInt(0);
    for (let b of blockBuf) block = (block << BigInt(8)) | BigInt(b);
    const permuted = desBitPerm(block, DES_IP, 64);
    let tmp = desRound(permuted, [...subkeys].reverse());
    const out = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) { out[i] = Number(tmp & BigInt(0xFF)); tmp >>= BigInt(8); }
    return out;
}

function desDecryptECB(data, keyBuf) {
    const subkeys = desGenerateSubkeys(keyBuf);
    const blocks = Math.ceil(data.length / 8);
    const out = [];
    for (let i = 0; i < blocks; i++) {
        const block = data.slice(i * 8, (i + 1) * 8);
        const padded = block.length < 8 ? Buffer.concat([block, Buffer.alloc(8 - block.length)]) : block;
        out.push(desDecryptBlock(padded, subkeys));
    }
    const result = Buffer.concat(out);
    // Strip PKCS#5 padding
    const padByte = result[result.length - 1];
    if (padByte > 0 && padByte <= 8) return result.slice(0, result.length - padByte);
    return result;
}

function decryptMediaUrl(encryptedUrl) {
    try {
        const key = Buffer.from(JIOSAAVN_DES_KEY);
        const encrypted = Buffer.from(encryptedUrl, 'base64');
        const decrypted = desDecryptECB(encrypted, key);
        const url = decrypted.toString('utf8').replace(/\0/g, '').trim();
        if (!url.startsWith('http')) throw new Error('Decrypted result is not a valid URL');
        // Upgrade to 320kbps
        return url.replace('_96.mp4', '_320.mp4')
                  .replace('_160.mp4', '_320.mp4')
                  .replace('_128.mp4', '_320.mp4')
                  .replace('_48.mp4', '_320.mp4');
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

const verifyAudioUrl = async (url) => {
    if (!url || !/^https?:\/\//i.test(url)) return null;

    return new Promise((resolve) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, {
            method: 'HEAD',
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
                'Range': 'bytes=0-0'
            }
        }, (res) => {
            const status = res.statusCode || 0;
            res.resume();
            resolve(status >= 200 && status < 400 ? url : null);
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.end();
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

// Helper to upgrade image quality (50x50/150x150 -> 500x500)
const hdImage = (url) => {
    if (!url) return '';
    if (Array.isArray(url)) {
        // Pick highest quality from array
        const sorted = [...url].sort((a, b) => {
            const qa = parseInt((a.quality || a.link || '').match(/(\d+)x/)?.[1] || '0');
            const qb = parseInt((b.quality || b.link || '').match(/(\d+)x/)?.[1] || '0');
            return qb - qa;
        });
        const best = sorted[0]?.link || sorted[0]?.url || '';
        return best.replace(/50x50|150x150/g, '500x500');
    }
    return url.replace(/50x50|150x150/g, '500x500');
};

// =================== RESOLVE FULL SONG URL ===================
// This is the core function that resolves a full-length HQ URL from a song ID

// JioSaavn CDN URLs expire quickly — DO NOT cache to disk.
// Only keep a short in-memory cache (5 min) to avoid hammering APIs on rapid play
let hqUrlCache = new Map();
// Clear URL cache every 5 minutes so we always get fresh (non-expired) CDN URLs
setInterval(() => { hqUrlCache.clear(); console.log('🗑️ HQ URL cache cleared'); }, 5 * 60 * 1000);

// Delete old stale disk cache if it exists
try {
    const cacheFile = path.join(__dirname, 'hq_url_cache.json');
    if (fs.existsSync(cacheFile)) { fs.unlinkSync(cacheFile); console.log('🗑️ Deleted stale disk cache'); }
} catch (_) {}

function saveCache() { /* no-op: disk cache disabled - CDN URLs expire */ }

async function resolveFullSongUrl(songId, songName = null, songArtist = null) {
    // Short in-memory cache hit
    if (hqUrlCache.has(songId)) {
        console.log(`🎵 Cache hit for song ${songId}`);
        return hqUrlCache.get(songId);
    }

    console.log(`🔍 Resolving full URL for: ${songName || songId}`);

    // STRATEGY 0: Use jiosaavn-api-beta.vercel.app (third-party API — works from cloud servers like Render)
    // This is the most reliable in production since official JioSaavn blocks cloud IPs
    try {
        console.log(`🌐 Strategy 0 (Vercel API): Fetching song ${songId}`);
        const hqData = await fetchJson(`https://jiosaavn-api-beta.vercel.app/songs?id=${songId}`, 8000);
        let song = null;
        if (hqData.data && Array.isArray(hqData.data)) song = hqData.data[0];
        else if (hqData.data && hqData.data.id) song = hqData.data;

        if (song) {
            const downloadUrls = song.downloadUrl || song.download_url || song.downloadLinks;
            if (downloadUrls && Array.isArray(downloadUrls)) {
                for (const candidate of downloadUrls) {
                    const link = candidate?.link || candidate?.url || (typeof candidate === 'string' ? candidate : null);
                    const verified = await verifyAudioUrl(link);
                    if (verified) {
                        console.log(`✅ Strategy 0 (Vercel API) SUCCESS for ${songId}`);
                        hqUrlCache.set(songId, verified);
                        saveCache();
                        return verified;
                    }
                }
            }
        }
    } catch (e) {
        console.warn(`⚠️ Strategy 0 (Vercel API) failed for ${songId}:`, e.message);
    }

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
                    saveCache();
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

    // STRATEGY 2: Use third-party JioSaavn API instances in parallel
    const thirdPartyApis = [
        `https://jiosaavn-api-beta.vercel.app/songs?id=${songId}`,
        `https://jiosaavn-api-three.vercel.app/songs?id=${songId}`,
        `https://jiosaavn-api-beta.vercel.app/api/songs?id=${songId}`,
        `https://jiosaavn-api-ashutosh.vercel.app/api/songs?id=${songId}`,
    ];

    try {
        console.log(`🚀 Strategy 2: Fetching from ${thirdPartyApis.length} third-party APIs in parallel...`);
        const link = await Promise.any(thirdPartyApis.map(api => new Promise(async (resolve, reject) => {
            try {
                const hqData = await fetchJson(api, 6000);
                
                let song = null;
                if (hqData.data && Array.isArray(hqData.data)) song = hqData.data[0];
                else if (hqData.data && hqData.data.id) song = hqData.data;
                else if (Array.isArray(hqData)) song = hqData[0];

                if (song) {
                    let downloadUrls = song.downloadUrl || song.download_url || song.downloadLinks;
                    if (downloadUrls && Array.isArray(downloadUrls)) {
                        for (const candidate of downloadUrls) {
                            const link = candidate?.link || candidate?.url || (typeof candidate === 'string' ? candidate : null);
                            if (!link) continue;
                            const verified = await verifyAudioUrl(link);
                            if (verified) return resolve({ link: verified, api });
                        }
                    }
                    if (song.url && typeof song.url === 'string' && song.url.includes('saavncdn')) {
                        const verified = await verifyAudioUrl(song.url);
                        if (verified) return resolve({ link: verified, api });
                    }
                }
                reject(new Error("No valid URL found"));
            } catch (err) {
                reject(err);
            }
        })));

        if (link && link.link) {
            console.log(`✅ Strategy 2 (${link.api}) SUCCESS for ${songId}`);
            hqUrlCache.set(songId, link.link);
            saveCache();
            return link.link;
        }
    } catch (e) {
        console.warn(`⚠️ Strategy 2 (Parallel API Fetch) failed for ${songId}`);
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
                        saveCache();
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

// =================== SONG FORMATTING & CLEANUP ===================

const cleanText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/This is a sample trailer\s*-\s*testing/gi, '')
        .replace(/sample trailer/gi, '')
        .replace(/testing/gi, '')
        .trim();
};

const formatSong = (song) => {
    const info = song.more_info || {};
    const songId = song.id;

    let name = cleanText(song.song || song.title || song.name || 'Melodify Track');

    // Extract real artist properly without fallback to test strings
    let artistCandidate = song.primary_artists || song.singers || info.singers || info.primary_artists;
    if (!artistCandidate && info.artistMap?.primary_artists?.length) {
        artistCandidate = info.artistMap.primary_artists.map(a => a.name).join(', ');
    }

    if (!artistCandidate && song.subtitle) {
        const cleanedSub = cleanText(song.subtitle);
        if (cleanedSub && !/sample|trailer|testing/i.test(cleanedSub)) {
            artistCandidate = cleanedSub;
        }
    }

    let artist = cleanText(artistCandidate);
    if (!artist || artist === 'Unknown Artist' || /sample|trailer|testing/i.test(artist)) {
        artist = cleanText(song.album || info.album) || 'Melodify Artist';
    }

    const preview = songId ? `${BASE_URL}/api/stream?id=${songId}&name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}` : '';

    return {
        id: songId,
        name: name,
        artist: artist,
        artistId: song.primary_artists_id?.split(', ')[0] || info.artistMap?.primary_artists?.[0]?.id || '',
        image: hdImage(song.image || info.image),
        preview_url: preview,
        duration_ms: (parseInt(song.duration || info.duration) || 0) * 1000,
        album: cleanText(song.album || info.album || ''),
        playCount: song.play_count || info.play_count || '0',
    };
};

// ========================== ENDPOINTS ==========================

// Audio Resolve — resolves HQ URL and returns 302 redirect to CDN directly
// This way expo-av streams directly from JioSaavn CDN, bypassing Render as middleman
app.get('/api/stream', async (req, res) => {
    let { id, name, artist } = req.query;

    if (!id) return res.status(400).send('Song ID is required');

    try {
        const resolvedUrl = await resolveFullSongUrl(id, name, artist);
        if (!resolvedUrl) {
            return res.status(404).send('Could not resolve song URL');
        }

        // ✅ PROXY the audio through our server instead of redirecting
        // This is required because JioSaavn CDN URLs expire within seconds
        // and browsers cannot directly fetch them after that.
        const rangeHeader = req.headers['range'];
        const fetchHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.jiosaavn.com/',
            'Origin': 'https://www.jiosaavn.com',
            'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
        };
        if (rangeHeader) fetchHeaders['Range'] = rangeHeader;

        const cdnResponse = await axios({
            method: 'GET',
            url: resolvedUrl,
            responseType: 'stream',
            maxRedirects: 10,
            timeout: 30000,
            headers: fetchHeaders,
        });

        // Forward relevant headers to client
        const status = cdnResponse.status === 206 ? 206 : 200;
        res.status(status);
        res.setHeader('Content-Type', cdnResponse.headers['content-type'] || 'audio/mpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Accept-Ranges', 'bytes');
        if (cdnResponse.headers['content-length']) {
            res.setHeader('Content-Length', cdnResponse.headers['content-length']);
        }
        if (cdnResponse.headers['content-range']) {
            res.setHeader('Content-Range', cdnResponse.headers['content-range']);
        }

        cdnResponse.data.pipe(res);
        cdnResponse.data.on('error', (err) => {
            console.error('Stream pipe error:', err.message);
            if (!res.headersSent) res.status(500).send('Stream pipe failed');
        });
    } catch (err) {
        console.error('Stream error:', err.message);
        if (!res.headersSent) return res.status(500).send('Stream failed');
    }
});

// Download Audio — streams the CDN file to the client as an attachment
app.get('/api/download', async (req, res) => {
    let { id, name, artist } = req.query;

    if (!id) return res.status(400).send('Song ID is required');

    try {
        const resolvedUrl = await resolveFullSongUrl(id, name, artist);
        if (!resolvedUrl) {
            return res.status(404).send('Could not resolve song URL for download');
        }

        // Fetch the audio stream from the CDN with proper headers
        const response = await axios({
            method: 'GET',
            url: resolvedUrl,
            responseType: 'stream',
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'audio/mpeg, audio/*, */*',
                'Referer': 'https://www.jiosaavn.com/'
            }
        });

        // Set headers to force download as MP3
        const safeName = (name || id).replace(/[^\w\s\-()]/gi, '').trim();
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        // Pipe the audio buffer stream to the client response
        response.data.pipe(res);

        // Handle errors mid-stream
        response.data.on('error', (err) => {
            console.error('Stream pipe error:', err.message);
            if (!res.headersSent) res.status(500).send('Stream failed');
        });
    } catch (err) {
        console.error('Download stream error:', err.message);
        if (!res.headersSent) return res.status(500).send('Download failed');
    }
});

// --- IN-MEMORY CACHE (No Redis needed!) ---
// Caches API responses to make UI navigation instant
const apiCache = new Map();
// Clear cache every 1 hour to prevent memory bloat
setInterval(() => apiCache.clear(), 60 * 60 * 1000);

// Search songs — tries multiple APIs for maximum production compatibility
// Priority: saavn.dev → official JioSaavn
// Search songs and artists — tries multiple APIs for maximum production compatibility
// Priority: saavn.dev → official JioSaavn
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);
    const cacheKey = `search_${query}`;
    if (apiCache.has(cacheKey)) return res.json(apiCache.get(cacheKey));

    // Helper: parse saavn.dev/saavnapi-style response
    const parseSaavnDevResults = (data) => {
        const results = data?.data?.results || data?.results || [];
        if (!Array.isArray(results) || results.length === 0) return null;
        return results.map(song => {
            const name = song.name || song.title || 'Unknown';
            const artist = song.artists?.primary?.map(a => a.name).join(', ')
                        || song.primaryArtists || song.singers || 'Unknown';
            const imgArr = song.image;
            let image = '';
            if (Array.isArray(imgArr)) {
                // Sort by resolution descending, pick highest
                const sorted = [...imgArr].sort((a, b) => {
                    const qa = parseInt((a.quality || '').replace(/[^\d]/g, '') || '0');
                    const qb = parseInt((b.quality || '').replace(/[^\d]/g, '') || '0');
                    return qb - qa;
                });
                image = sorted[0]?.link || imgArr[imgArr.length - 1]?.link || '';
            } else {
                image = imgArr || '';
            }
            // Always upgrade to 500x500
            image = image.replace(/50x50|150x150/g, '500x500');
            return {
                id: song.id,
                name,
                artist,
                image,
                preview_url: `${BASE_URL}/api/stream?id=${song.id}&name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}`,
                duration_ms: (parseInt(song.duration) || 0) * 1000,
                album: song.album?.name || song.album || '',
                playCount: song.playCount || '0',
                type: 'song'
            };
        });
    };

    // Helper: parse saavn.dev/saavnapi-style artist results
    const parseSaavnDevArtists = (data) => {
        const results = data?.data?.results || data?.results || [];
        if (!Array.isArray(results)) return [];
        return results.filter(a => a && a.id).map(artist => {
            const imgArr = artist.image;
            let image = '';
            if (Array.isArray(imgArr)) {
                const sorted = [...imgArr].sort((a, b) => {
                    const qa = parseInt((a.quality || '').replace(/[^\d]/g, '') || '0');
                    const qb = parseInt((b.quality || '').replace(/[^\d]/g, '') || '0');
                    return qb - qa;
                });
                image = sorted[0]?.link || imgArr[imgArr.length - 1]?.link || '';
            } else {
                image = imgArr || '';
            }
            image = image.replace(/50x50|150x150/g, '500x500');
            return {
                id: artist.id,
                name: artist.name,
                image,
                type: 'artist'
            };
        });
    };

    // --- CLOUD-FRIENDLY APIs (work from Render) ---
    const cloudApis = [
        `https://jiosaavn-api-beta.vercel.app/search/songs?query=${encodeURIComponent(query)}&limit=20`,
    ];

    // Fetch songs and artists IN PARALLEL for speed
    const [songsSettled, artistsSettled] = await Promise.allSettled([
        // Songs: try Vercel wrapper, fallback to official API
        (async () => {
            for (const apiUrl of cloudApis) {
                try {
                    console.log(`[search] Trying songs: ${apiUrl.slice(0, 60)}...`);
                    const data = await fetchJson(apiUrl, 7000);
                    const parsed = parseSaavnDevResults(data);
                    if (parsed && parsed.length > 0) { console.log(`[search] SUCCESS: ${parsed.length} songs`); return parsed; }
                } catch (err) {
                    console.warn(`[search] songs failed:`, err.message);
                }
            }
            // Fallback to official JioSaavn
            console.log(`[search] Falling back to official JioSaavn for songs`);
            const data = await jiosaavnRequest({ __call: 'search.getResults', q: query, n: '20' });
            return (data.results || []).map(formatSong).map(t => ({ ...t, type: 'song' }));
        })(),
        // Artists: try Vercel wrapper, fallback to official API
        (async () => {
            try {
                const artistUrl = `https://jiosaavn-api-beta.vercel.app/search/artists?query=${encodeURIComponent(query)}&limit=10`;
                const artistData = await fetchJson(artistUrl, 5000);
                return parseSaavnDevArtists(artistData);
            } catch (err) {
                console.warn(`[search] Cloud artists failed:`, err.message);
                const artistData = await jiosaavnRequest({ __call: 'search.getArtistResults', q: query, n: '10' });
                if (artistData && Array.isArray(artistData.results)) {
                    return artistData.results.map(a => ({
                        id: a.id,
                        name: a.name,
                        image: hdImage(a.image),
                        type: 'artist'
                    }));
                }
                return [];
            }
        })()
    ]);

    const tracks = songsSettled.status === 'fulfilled' ? (songsSettled.value || []) : [];
    const artistsResults = artistsSettled.status === 'fulfilled' ? (artistsSettled.value || []) : [];

    const combinedResults = [...tracks, ...artistsResults];
    if (combinedResults.length > 0) {
        apiCache.set(cacheKey, combinedResults);
        return res.json(combinedResults);
    }

    res.status(500).json({ error: 'Search unavailable. All APIs failed.', query });
});

// Get trending/popular songs for home page (Top Hits)
app.get('/api/top-tracks', async (req, res) => {
    const cacheKey = 'top_tracks';
    if (apiCache.has(cacheKey)) return res.json(apiCache.get(cacheKey));

    try {
        // Try Vercel wrapper first (faster from cloud)
        let tracks = [];
        try {
            const data = await fetchJson('https://jiosaavn-api-beta.vercel.app/search/songs?query=top+hindi+songs+2025&limit=20', 7000);
            const results = data?.data?.results || data?.results || [];
            if (results.length > 0) {
                tracks = results.map(song => {
                    const imgArr = song.image;
                    let image = '';
                    if (Array.isArray(imgArr)) {
                        const sorted = [...imgArr].sort((a, b) => parseInt((b.quality||'').replace(/[^\d]/g,'')) - parseInt((a.quality||'').replace(/[^\d]/g,'')));
                        image = sorted[0]?.link || '';
                    } else { image = imgArr || ''; }
                    image = image.replace(/50x50|150x150/g, '500x500');
                    const name = song.name || song.title || '';
                    const artist = song.artists?.primary?.map(a => a.name).join(', ') || song.primaryArtists || '';
                    return {
                        id: song.id,
                        name,
                        artist,
                        image,
                        preview_url: `${BASE_URL}/api/stream?id=${song.id}&name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}`,
                        duration_ms: (parseInt(song.duration) || 0) * 1000,
                        album: song.album?.name || song.album || '',
                    };
                });
            }
        } catch (e) { console.warn('top-tracks Vercel failed, falling back to official:', e.message); }

        // Fallback: official JioSaavn
        if (tracks.length === 0) {
            const data = await jiosaavnRequest({ __call: 'search.getResults', q: 'top hindi songs 2025', n: '20' });
            tracks = (data.results || []).map(formatSong);
        }

        apiCache.set(cacheKey, tracks);
        res.json(tracks);
    } catch (err) {
        console.error('Top tracks error:', err.message);
        res.status(500).json({ error: 'Failed to fetch top tracks', details: err.message });
    }
});

// Get new releases / albums for home page
app.get('/api/recommendations', async (req, res) => {
    const cacheKey = 'recommendations';
    if (apiCache.has(cacheKey)) return res.json(apiCache.get(cacheKey));

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
        apiCache.set(cacheKey, albums);
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

// YouTube Video Search — returns a YouTube video ID for a given song query
app.get('/api/video', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    try {
        const result = await yts(q + ' official music video');
        const video = result.videos?.[0];
        if (!video) return res.status(404).json({ error: 'No video found' });

        res.json({
            videoId: video.videoId,
            title: video.title,
            thumbnail: video.thumbnail,
            url: video.url,
        });
    } catch (err) {
        console.error('YouTube search error:', err.message);
        res.status(500).json({ error: 'Failed to search YouTube' });
    }
});

app.get('/api/ai-mood', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a music vibe expert. A user says: "${query}". Analyze this mood/sentence and return exactly ONE highly searchable music query (max 2-3 words) that would yield the best songs for this mood when searched on JioSaavn. For example, if they say "aaj mera mood bahut kharab hai", return "Sad Hindi". If they say "party karni hai", return "Bollywood Party". If they say "I want to relax", return "Lofi Chill". DO NOT return anything else except the short search query string.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const keywords = response.text.trim().replace(/['"]/g, '');
        
        // Use the existing Saavn search api internally
        const data = await jiosaavnRequest({
            __call: 'search.getResults',
            q: keywords,
            n: '15',
        });
        
        const tracks = (data.results || []).map(formatSong);
        res.json({ keywords, tracks });
        
    } catch (error) {
        console.error('AI Mood Error:', error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// =================== 🤖 AI HUB ROUTES ===================

// 1. VIBE DNA — Analyze listening history and generate a music personality profile
app.post('/api/ai/vibe-dna', async (req, res) => {
    try {
        const { songs } = req.body;
        if (!songs || songs.length === 0) return res.status(400).json({ error: 'No songs provided' });
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const songList = songs.slice(0, 30).map(s => `${s.name} by ${s.artist}`).join(', ');
        const prompt = `You are a music personality analyst. Analyze this person's listening history and create their "Vibe DNA" profile.\n\nSongs they listen to: ${songList}\n\nReturn a JSON object with these exact keys:\n{\n  "title": "A creative 3-4 word music personality title (e.g., 'Moonlit Soul Seeker')",\n  "emoji": "2-3 emojis representing their vibe",\n  "description": "A 2-3 sentence poetic description of their music personality in English",\n  "traits": ["4 personality trait words like 'Emotional', 'Adventurous', 'Nostalgic', 'Energetic'"],\n  "dominantMood": "their dominant mood in 2 words",\n  "hiddenSide": "A fun surprising insight about their taste in 1 sentence",\n  "compatibleWith": "Types of people they'd vibe with musically in 1 sentence",\n  "searchQuery": "A 2-3 word JioSaavn search query that best matches their taste"\n}\nReturn ONLY valid JSON, no markdown.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        let dnaData;
        try {
            const cleaned = response.text.trim().replace(/```json|```/g, '').trim();
            dnaData = JSON.parse(cleaned);
        } catch(e) { return res.status(500).json({ error: 'Failed to parse AI response' }); }
        const searchData = await jiosaavnRequest({ __call: 'search.getResults', q: dnaData.searchQuery || 'mood music', n: '10' });
        const tracks = (searchData.results || []).map(formatSong);
        res.json({ dna: dnaData, tracks });
    } catch (error) {
        console.error('Vibe DNA Error:', error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// 2. AI MUSIC THERAPIST — Mood diary entry → healing playlist + message
app.post('/api/ai/therapist', async (req, res) => {
    try {
        const { mood } = req.body;
        if (!mood) return res.status(400).json({ error: 'Mood text is required' });
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an empathetic AI music therapist. A user shared their feelings: "${mood}"\n\nAnalyze their emotional state and create a therapeutic music journey.\n\nReturn a JSON object:\n{\n  "therapistMessage": "A warm, empathetic 2-3 sentence message to the user acknowledging their feelings (in Hinglish or English based on their input language)",\n  "journeyTitle": "A poetic name for this healing music journey (e.g., 'Rising from the Storm')",\n  "phases": [\n    {"name": "Acknowledge", "description": "Start where you are", "query": "JioSaavn search query for this phase", "emoji": "💙"},\n    {"name": "Process", "description": "Let it all out", "query": "JioSaavn search query", "emoji": "🌧"},\n    {"name": "Shift", "description": "Gentle transition", "query": "JioSaavn search query", "emoji": "🌤"},\n    {"name": "Rise", "description": "Feel yourself again", "query": "JioSaavn search query", "emoji": "☀️"}\n  ],\n  "affirmation": "A short powerful affirmation sentence for them"\n}\nReturn ONLY valid JSON.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        let therapyData;
        try {
            const cleaned = response.text.trim().replace(/```json|```/g, '').trim();
            therapyData = JSON.parse(cleaned);
        } catch(e) { return res.status(500).json({ error: 'Failed to parse AI response' }); }
        const phaseResults = await Promise.all(
            therapyData.phases.map(async (phase) => {
                try {
                    const data = await jiosaavnRequest({ __call: 'search.getResults', q: phase.query, n: '4' });
                    return { ...phase, tracks: (data.results || []).map(formatSong) };
                } catch { return { ...phase, tracks: [] }; }
            })
        );
        therapyData.phases = phaseResults;
        res.json(therapyData);
    } catch (error) {
        console.error('Therapist Error:', error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// 3. STORY MODE — A scenario → cinematic music journey with narration
app.post('/api/ai/story-mode', async (req, res) => {
    try {
        const { scenario } = req.body;
        if (!scenario) return res.status(400).json({ error: 'Scenario is required' });
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a cinematic music storyteller. Create a musical journey for this scenario: "${scenario}"\n\nReturn a JSON object:\n{\n  "storyTitle": "Creative story title",\n  "storyIntro": "A 2-sentence cinematic intro setting the scene",\n  "chapters": [\n    {"chapterName": "Chapter name", "narration": "1-2 sentence narration for this moment", "query": "JioSaavn search query", "emoji": "emoji"},\n    {"chapterName": "...", "narration": "...", "query": "...", "emoji": "..."},\n    {"chapterName": "...", "narration": "...", "query": "...", "emoji": "..."},\n    {"chapterName": "...", "narration": "...", "query": "...", "emoji": "..."},\n    {"chapterName": "...", "narration": "...", "query": "...", "emoji": "..."}\n  ],\n  "epilogue": "A beautiful closing line for the story"\n}\nReturn ONLY valid JSON.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        let storyData;
        try {
            const cleaned = response.text.trim().replace(/```json|```/g, '').trim();
            storyData = JSON.parse(cleaned);
        } catch(e) { return res.status(500).json({ error: 'Failed to parse AI response' }); }
        const chapterResults = await Promise.all(
            storyData.chapters.map(async (chapter) => {
                try {
                    const data = await jiosaavnRequest({ __call: 'search.getResults', q: chapter.query, n: '3' });
                    return { ...chapter, tracks: (data.results || []).map(formatSong) };
                } catch { return { ...chapter, tracks: [] }; }
            })
        );
        storyData.chapters = chapterResults;
        res.json(storyData);
    } catch (error) {
        console.error('Story Mode Error:', error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// 4. EMOTION MIRROR — Webcam image → Gemini Vision mood → songs
app.post('/api/ai/emotion', async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'Image data required' });
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [
                { text: `Analyze this person's facial expression and body language. Determine their current emotional state.\n\nReturn a JSON object:\n{\n  "detectedMood": "Primary detected mood in 2 words (e.g., 'Happy Energetic', 'Calm Tired', 'Sad Reflective')",\n  "confidence": "High/Medium/Low",\n  "moodEmoji": "2 emojis for the mood",\n  "moodMessage": "A friendly 1-sentence observation about their mood",\n  "musicRecommendation": "Why this music fits their current state in 1 sentence",\n  "searchQuery": "A 2-3 word JioSaavn search query perfectly matching their mood"\n}\nReturn ONLY valid JSON.` },
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
            ]}]
        });
        let emotionData;
        try {
            const cleaned = response.text.trim().replace(/```json|```/g, '').trim();
            emotionData = JSON.parse(cleaned);
        } catch(e) { return res.status(500).json({ error: 'Failed to analyze image' }); }
        const searchData = await jiosaavnRequest({ __call: 'search.getResults', q: emotionData.searchQuery, n: '12' });
        const tracks = (searchData.results || []).map(formatSong);
        res.json({ emotion: emotionData, tracks });
    } catch (error) {
        console.error('Emotion Mirror Error:', error);
        res.status(500).json({ error: 'Emotion detection failed' });
    }
});

// 5. HUM SEARCH — Audio base64 → Gemini identifies the song → search
app.post('/api/ai/hum-search', async (req, res) => {
    try {
        const { audioBase64, mimeType } = req.body;
        if (!audioBase64) return res.status(400).json({ error: 'Audio data required' });
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const base64Data = audioBase64.replace(/^data:[^;]+;base64,/, '');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [
                { text: `Listen to this audio carefully. The person is humming, singing, or whistling a song. Try to identify what song it might be.\n\nReturn a JSON object:\n{\n  "identified": true or false,\n  "songName": "Name of the song if identified, else null",\n  "artist": "Artist name if identified, else null",\n  "confidence": "High/Medium/Low",\n  "searchQuery": "Best 2-4 word JioSaavn search query to find this song",\n  "message": "A friendly message about what you heard"\n}\nReturn ONLY valid JSON.` },
                { inlineData: { mimeType: mimeType || 'audio/webm', data: base64Data } }
            ]}]
        });
        let humData;
        try {
            const cleaned = response.text.trim().replace(/```json|```/g, '').trim();
            humData = JSON.parse(cleaned);
        } catch(e) { return res.status(500).json({ error: 'Failed to process audio' }); }
        const searchData = await jiosaavnRequest({ __call: 'search.getResults', q: humData.searchQuery || 'popular songs', n: '10' });
        const tracks = (searchData.results || []).map(formatSong);
        res.json({ result: humData, tracks });
    } catch (error) {
        console.error('Hum Search Error:', error);
        res.status(500).json({ error: 'Hum search failed' });
    }
});

// 6. COLLAB PLAYLIST — Two users' song lists → Gemini merges → shared playlist
app.post('/api/ai/collab', async (req, res) => {
    try {
        const { person1Songs, person2Songs, person1Name, person2Name } = req.body;
        if (!person1Songs || !person2Songs) return res.status(400).json({ error: 'Both song lists required' });
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const p1List = person1Songs.slice(0, 15).map(s => `${s.name} by ${s.artist}`).join(', ');
        const p2List = person2Songs.slice(0, 15).map(s => `${s.name} by ${s.artist}`).join(', ');
        const prompt = `You are a musical matchmaker. Two people want to create a shared playlist.\n\n${person1Name || 'Person 1'} likes: ${p1List}\n${person2Name || 'Person 2'} likes: ${p2List}\n\nReturn a JSON object:\n{\n  "playlistName": "A creative name for their shared playlist",\n  "compatibilityScore": "A percentage like '78%'",\n  "compatibilityMessage": "A fun 1-2 sentence analysis of their musical chemistry",\n  "commonGround": "What they both love in 1 sentence",\n  "surpriseFactor": "Something surprising about their combined taste",\n  "searchQueries": ["query1", "query2", "query3"]\n}\nReturn ONLY valid JSON.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        let collabData;
        try {
            const cleaned = response.text.trim().replace(/```json|```/g, '').trim();
            collabData = JSON.parse(cleaned);
        } catch(e) { return res.status(500).json({ error: 'Failed to parse AI response' }); }
        const allTracks = [];
        for (const q of (collabData.searchQueries || [])) {
            try {
                const data = await jiosaavnRequest({ __call: 'search.getResults', q, n: '5' });
                allTracks.push(...(data.results || []).map(formatSong));
            } catch {}
        }
        res.json({ collab: collabData, tracks: allTracks });
    } catch (error) {
        console.error('Collab Error:', error);
        res.status(500).json({ error: 'Collab generation failed' });
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

