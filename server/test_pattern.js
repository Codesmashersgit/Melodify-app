const https = require('https');

async function testUrl(url) {
    return new Promise((resolve) => {
        https.get(url, { method: 'HEAD' }, (res) => {
            console.log(`URL: ${url} -> Status: ${res.statusCode}`);
            resolve(res.statusCode === 200 || res.statusCode === 206);
        }).on('error', () => resolve(false));
    });
}

async function run() {
    const id = "10912020949005";
    // Pattern: aac.saavncdn.com / <last 3 digits of prefix or some subfolder> / <ID>_320.mp4
    // Looking at preview: preview.saavncdn.com / 005 / ID.mp3
    // So maybe: aac.saavncdn.com / 005 / ID_320.mp4
    
    const candidates = [
        `https://aac.saavncdn.com/005/${id}_320.mp4`,
        `https://aac.saavncdn.com/005/${id}_320.aac`,
        `https://aac.saavncdn.com/005/${id}_160.mp4`,
        `https://aac.saavncdn.com/005/${id}_128.mp4`,
    ];
    
    for (const c of candidates) {
        await testUrl(c);
    }
}

run();
