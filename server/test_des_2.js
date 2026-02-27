const crypto = require('crypto');

function decrypt(encryptedData) {
    const key = '38346591';
    const decipher = crypto.createDecipheriv('des-ecb', key, '');
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted.trim();
}

const testData = 'ID2ieOjCrwfgWvL5sXl4B1ImC5QfbsDy/nmJXdjAMnlOJXeYHjuTbH6NRJQzI7YR8SWy2bJiRWKtBNBwJmCLrhw7tS9a8Gtq';
try {
    const result = decrypt(testData);
    console.log('Decrypted:', result);
    console.log('HQ:', result.replace(/_96\.(mp4|aac|m4a|mp3)/, '_320.mp4'));
} catch (e) {
    console.error('Error:', e.message);
}
