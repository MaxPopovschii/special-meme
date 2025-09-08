const crypto = require('crypto');

class Wallet {
    constructor() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 512,
        });
        this.privateKey = privateKey.export({ type: 'pkcs1', format: 'pem' });
        this.publicKey = publicKey.export({ type: 'pkcs1', format: 'pem' });
        this.address = crypto.createHash('sha256').update(this.publicKey).digest('hex');
    }

    sign(data) {
        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(data)).end();
        return sign.sign(this.privateKey, 'hex');
    }

    static verify(data, signature, publicKey) {
        const verify = crypto.createVerify('SHA256');
        verify.update(JSON.stringify(data));
        return verify.verify(publicKey, signature, 'hex');
    }
}

module.exports = Wallet;