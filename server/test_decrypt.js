const crypto = require('crypto');

function decrypt(url) {
    try {
        const key = Buffer.from('38346591');
        const decipher = crypto.createDecipheriv('des-ecb', key, Buffer.alloc(0));
        decipher.setAutoPadding(true);
        let decrypted = decipher.update(url, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return "Fail: " + e.message;
    }
}

function decrypt2(url) {
    try {
        const key = Buffer.from('38346591');
        const decipher = crypto.createDecipher('des-ecb', key); // deprecated but let's test
        let decrypted = decipher.update(url, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return "Fail2: " + e.message;
    }
}

function decrypt3(url) {
    try {
        const crypto = require('crypto');
        const desKey = Buffer.from('38346591', 'utf-8');
        const iv = Buffer.alloc(0);
        const decipher = crypto.createDecipheriv('des-ecb', desKey, iv);
        decipher.setAutoPadding(false); // maybe false?
        const encryptedBuffer = Buffer.from(url, 'base64');
        let decrypted = decipher.update(encryptedBuffer, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch(e) {
        return "Fail3 " + e.message;
    }
}

const url = "ID2ieOjCrwZ9aP+9Vws6KBJswtBw7tS9a8GtqP2L2N+2wYy371xXwJ2f4mS1J61+Xn05S1Q4fWz1x1PqT/4D0L+wO7eL5sXf";
console.log(decrypt(url));
console.log(decrypt2(url));
console.log(decrypt3(url));
