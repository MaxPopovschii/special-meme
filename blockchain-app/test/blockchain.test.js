const Blockchain = require('../src/blockchain');
const Wallet = require('../src/wallet');

test('should mine and transfer', () => {
    const chain = new Blockchain();
    const alice = new Wallet();
    const bob = new Wallet();
    const tx = {
        from: alice.publicKey,
        to: bob.address,
        amount: 5,
        signature: alice.sign({ from: alice.publicKey, to: bob.address, amount: 5 })
    };
    chain.addTransaction(tx);
    chain.minePendingTransactions(alice.address);
    expect(chain.getBalance(bob.address)).toBe(5);
});