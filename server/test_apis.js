const https = require('https');

async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function run() {
    const songId = "BBLYc4mS";
    const apis = [
        `https://saavn.dev/api/songs/${songId}`,
        `https://jiosaavn-api-privatecvc2.vercel.app/api/songs/${songId}`,
    ];
    
    for (const api of apis) {
        try {
            console.log(`Testing ${api}...`);
            const data = await fetchJson(api);
            console.log(`Success from ${api}`);
            const urls = data.data?.[0]?.downloadUrl || data.data?.downloadUrl;
            if (urls) {
                console.log("Found download URLs:", urls[urls.length - 1]);
            } else {
                console.log("No download URLs in response");
            }
        } catch (e) {
            console.error(`Failed ${api}:`, e.message);
        }
    }
}

run();
