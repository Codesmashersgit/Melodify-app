const https = require('https');

async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { 
                    console.log("Response starts with:", data.substring(0, 100));
                    reject(e); 
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    const query = encodeURIComponent("Mera Dil Bhi Kitna Pagal Hai");
    const url = `https://saavn.dev/api/search/songs?query=${query}&limit=1`;
    
    try {
        console.log(`Searching via saavn.dev: ${url}`);
        const data = await fetchJson(url);
        console.log("Found:", data.data?.results?.[0]?.name);
        const links = data.data?.results?.[0]?.downloadUrl;
        console.log("Download Link:", links?.[links.length-1]?.url || "NONE");
    } catch (e) {
        console.error("Search failed:", e.message);
    }
}

run();
