const Blockchain = require('./blockchain-app/src/blockchain');
const Wallet = require('./blockchain-app/src/wallet');

const chain = new Blockchain();
const alice = new Wallet();

console.log('Genesis block hash:', chain.chain[0].hash);
console.log('Expected difficulty:', chain.difficulty);
console.log('Genesis block starts with zeros:', chain.chain[0].hash.substring(0, chain.difficulty));
console.log('Is chain valid after genesis?', chain.isChainValid());

chain.minePendingTransactions(alice.address);
console.log('\nAfter first mining:');
console.log('Block 1 hash:', chain.chain[1].hash);
console.log('Block 1 starts with:', chain.chain[1].hash.substring(0, chain.difficulty));
console.log('Is chain valid?', chain.isChainValid());

// Check each block individually
for (let i = 1; i < chain.chain.length; i++) {
    const block = chain.chain[i];
    const expectedZeros = Array(chain.difficulty + 1).join("0");
    const actualStart = block.hash.substring(0, chain.difficulty);
    console.log(`\nBlock ${i}:`);
    console.log(`  Hash: ${block.hash}`);
    console.log(`  Expected start: ${expectedZeros}`);
    console.log(`  Actual start: ${actualStart}`);
    console.log(`  Match: ${actualStart === expectedZeros}`);
    
    // Recalculate hash
    const recalculated = chain.calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce);
    console.log(`  Hash matches: ${block.hash === recalculated}`);
}
