const Wallet = require('../src/wallet');

describe('Wallet', () => {
    test('Creates a wallet with address, public and private keys', () => {
        const wallet = new Wallet();
        expect(wallet.address).toBeDefined();
        expect(wallet.publicKey).toBeDefined();
        expect(wallet.privateKey).toBeDefined();
        expect(wallet.address.length).toBe(64); // SHA256 hash length
    });

    test('Address is derived from public key', () => {
        const wallet = new Wallet();
        const crypto = require('crypto');
        const expectedAddress = crypto.createHash('sha256').update(wallet.publicKey).digest('hex');
        expect(wallet.address).toBe(expectedAddress);
    });

    test('Can sign data', () => {
        const wallet = new Wallet();
        const data = { message: 'test' };
        const signature = wallet.sign(data);
        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');
    });

    test('Can verify signed data', () => {
        const wallet = new Wallet();
        const data = { from: wallet.address, to: 'recipient', amount: 10 };
        const signature = wallet.sign(data);
        
        const isValid = Wallet.verify(data, signature, wallet.publicKey);
        expect(isValid).toBe(true);
    });

    test('Invalid signature fails verification', () => {
        const wallet = new Wallet();
        const data = { from: wallet.address, to: 'recipient', amount: 10 };
        const signature = wallet.sign(data);
        
        // Modify the data
        data.amount = 20;
        
        const isValid = Wallet.verify(data, signature, wallet.publicKey);
        expect(isValid).toBe(false);
    });

    test('Different wallets have different addresses', () => {
        const wallet1 = new Wallet();
        const wallet2 = new Wallet();
        expect(wallet1.address).not.toBe(wallet2.address);
    });
});
