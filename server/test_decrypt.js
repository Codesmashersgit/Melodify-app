const crypto = require('crypto');

// The JioSaavn decryption key
const JIOSAAVN_KEY = '3834663638363632';

// Decryption logic for JioSaavn encrypted URLs
function decryptUrl(encryptedUrl) {
    try {
        // We use des-ede3 (Triple DES) which is often used as a fallback for 16-byte keys in Node
        // for regular DES-ECB. Actually, we'll try to use a more robust way.
        // Node 17+ requires --openssl-legacy-provider for 'des-ecb'
        // But many servers don't have it.
        // Let's try the direct Node crypto one more time with a trick.

        // If this fails, we will use a fallback or an error message.
        const decipher = crypto.createDecipheriv('des-ecb', Buffer.from(JIOSAAVN_KEY.substring(0, 8), 'utf8'), '');
        let decrypted = decipher.update(encryptedUrl, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        // Pattern for JioSaavn full links
        // The decrypted path often looks like 'path/to/song'
        return `https://aac.saavncdn.com/${decrypted}_320.mp4`;
    } catch (e) {
        console.error('Decryption failed:', e.message);
        return null;
    }
}

// Test with Soulmate
const encrypted = 'ID2ieOjCrwfgWvL5sXl4B1ImC5QfbsDy/tWfK+bl5vTcbVsl/KiLemjCW8W1iitP5bxYiSsL1vg0kAxBaw52ghw7tS9a8Gtq';
console.log('Result:', decryptUrl(encrypted));
