const https = require('https');

const jiosaavnRequest = (params) => {
    return new Promise((resolve, reject) => {
        const searchParams = {
            ...params,
            _format: 'json',
            _marker: '0',
            cc: 'in',
            api_version: '3', // Try version 3
            ctx: 'web'
        };
        const queryString = new URLSearchParams(searchParams).toString();
        const url = `https://www.jiosaavn.com/api.php?${queryString}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
};

async function test() {
    try {
        const id = "BBLYc4mS";
        console.log("Getting details for ID (v3):", id);
        const details = await jiosaavnRequest({
            __call: 'song.getDetails',
            pids: id
        });
        
        const songInfo = details[id];
        console.log("Encrypted URL (v3):", songInfo?.encrypted_media_url || "NONE");

    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
