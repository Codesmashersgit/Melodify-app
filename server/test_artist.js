const https = require('https');

const jiosaavnRequest = (params) => {
    return new Promise((resolve, reject) => {
        const searchParams = {
            ...params,
            _format: 'json',
            _marker: '0',
            cc: 'in',
            api_version: '4',
            ctx: 'wap6dot0'
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
    // Arijit Singh ID: 456209
    console.log('Testing search.getArtistResults with ID 456209...');
    const data = await jiosaavnRequest({
        __call: 'search.getArtistResults',
        q: '456209',
        n: '1'
    });
    console.log('Result:', JSON.stringify(data, null, 2));

    console.log('\nTesting search.getResults for Arijit Singh...');
    const data2 = await jiosaavnRequest({
        __call: 'search.getResults',
        q: 'Arijit Singh',
        n: '5'
    });
    console.log('Song results count:', data2.results?.length);
}

test();
