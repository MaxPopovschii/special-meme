// Quick validation test
const Blockchain = require('./blockchain-app/src/blockchain');
const Wallet = require('./blockchain-app/src/wallet');

console.log('Test 1: Genesis block validation');
const chain = new Blockchain();
const genesisValid = chain.isChainValid();
console.log('Genesis valid:', genesisValid);
console.log('Genesis hash:', chain.chain[0].hash);
console.log('Genesis nonce:', chain.chain[0].nonce);

console.log('\nTest 2: After mining');
const alice = new Wallet();
chain.minePendingTransactions(alice.address);
console.log('Chain length:', chain.chain.length);
console.log('Chain valid:', chain.isChainValid());
console.log('Last block hash:', chain.getLatestBlock().hash);
console.log('Last block nonce:', chain.getLatestBlock().nonce);

console.log('\nTest 3: Transaction');
chain.minePendingTransactions(alice.address);
const bob = new Wallet();
const tx = {
    from: alice.address,
    to: bob.address,
    amount: 1,
    publicKey: alice.publicKey,
    signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
};
chain.addTransaction(tx);
chain.minePendingTransactions(alice.address);
console.log('Chain valid after transaction:', chain.isChainValid());
console.log('Alice balance:', chain.getBalance(alice.address));
console.log('Bob balance:', chain.getBalance(bob.address));
