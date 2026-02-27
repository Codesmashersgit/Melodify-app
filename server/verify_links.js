const https = require('https');

const base = 'https://aac.saavncdn.com/406/af57a9b63876b01fd3fa611bcd221706';
const variants = [
    '_96.mp4',
    '_320.mp4',
    '_320.m4a',
    '_160.mp4',
    '_320.aac',
    '.mp4'
];

variants.forEach(ext => {
    const url = base + ext;
    https.get(url, { method: 'HEAD' }, (res) => {
        if (res.statusCode === 200) {
            console.log(`✅ FOUND: ${url} (Size: ${res.headers['content-length']})`);
        } else {
            console.log(`❌ 404: ${url}`);
        }
    }).on('error', e => console.error(e.message));
});
