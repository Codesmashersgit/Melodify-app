const crypto = require('crypto');

function testDecrypt(label, encryptedData, key, algorithm, autoPadding = true) {
    try {
        const decipher = crypto.createDecipheriv(algorithm, key, '');
        decipher.setAutoPadding(autoPadding);
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        console.log(`[${label}] Success:`, decrypted.trim());
    } catch (e) {
        // console.log(`[${label}] Failed:`, e.message);
    }
}

const testData = 'ID2ieOjCrwfgWvL5sXl4B1ImC5QfbsDy/tWfK+bl5vTcbVsl/KiLemjCW8W1iitP5bxYiSsL1vg0kAxBaw52ghw7tS9a8Gtq';

console.log('--- Testing New Key: 38346591 ---');
testDecrypt('ECB / PKCS5 / 38346591', testData, '38346591', 'des-ecb', true);

console.log('--- Testing New Key: 84f68662 (Refined) ---');
testDecrypt('ECB / PKCS5 / 84f68662', testData, '84f68662', 'des-ecb', true);

console.log('--- Testing New Key: b31ixia9 ---'); // From another source
testDecrypt('ECB / PKCS5 / b31ixia9', testData, 'b31ixia9', 'des-ecb', true);
