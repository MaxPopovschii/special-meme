/**
 * Complete example demonstrating all blockchain features
 */

const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const SmartContract = require('./smart-contracts/contract');
const P2PServer = require('./p2p');
const config = require('./config');

console.log('=== Blockchain Complete Example ===\n');

// 1. Create blockchain instance
console.log('1. Creating blockchain...');
const chain = new Blockchain(config.blockchain.difficulty);
console.log(`✓ Blockchain created with difficulty ${config.blockchain.difficulty}`);
console.log(`  Initial chain length: ${chain.chain.length}\n`);

// 2. Create wallets
console.log('2. Creating wallets...');
const alice = new Wallet();
const bob = new Wallet();
const carol = new Wallet();
console.log(`✓ Created 3 wallets`);
console.log(`  Alice: ${alice.address.substring(0, 16)}...`);
console.log(`  Bob:   ${bob.address.substring(0, 16)}...`);
console.log(`  Carol: ${carol.address.substring(0, 16)}...\n`);

// 3. Initial mining to give Alice some balance
console.log('3. Mining initial blocks for Alice...');
chain.minePendingTransactions(alice.address);
console.log(`  Block #${chain.chain.length - 1} mined`);
chain.minePendingTransactions(alice.address);
console.log(`  Block #${chain.chain.length - 1} mined`);
console.log(`✓ Alice balance: ${chain.getBalance(alice.address)} coins\n`);

// 4. Create and sign transactions
console.log('4. Creating signed transactions...');
const tx1 = {
    from: alice.address,
    to: bob.address,
    amount: 1,
    publicKey: alice.publicKey,
    signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
};
chain.addTransaction(tx1);
console.log(`✓ Transaction added: Alice -> Bob (1 coin)`);

const tx2 = {
    from: alice.address,
    to: carol.address,
    amount: 0.5,
    publicKey: alice.publicKey,
    signature: alice.sign({ from: alice.address, to: carol.address, amount: 0.5 })
};
chain.addTransaction(tx2);
console.log(`✓ Transaction added: Alice -> Carol (0.5 coins)`);
console.log(`  Pending transactions: ${chain.pendingTransactions.length}\n`);

// 5. Mine the transactions
console.log('5. Mining pending transactions...');
chain.minePendingTransactions(bob.address);
console.log(`✓ Block #${chain.chain.length - 1} mined by Bob`);
console.log(`  Balances after mining:`);
console.log(`  - Alice: ${chain.getBalance(alice.address)} coins`);
console.log(`  - Bob:   ${chain.getBalance(bob.address)} coins`);
console.log(`  - Carol: ${chain.getBalance(carol.address)} coins\n`);

// 6. Deploy a smart contract
console.log('6. Deploying smart contract...');
const tokenContract = new SmartContract('TokenContract', alice.address);
tokenContract.deploy({
    totalSupply: 1000,
    balances: {
        [alice.address]: 1000
    }
});
chain.deployContract(tokenContract);
console.log(`✓ TokenContract deployed by Alice`);
console.log(`  Total supply: 1000 tokens\n`);

// 7. Execute contract methods
console.log('7. Executing contract methods...');
tokenContract.execute('transfer', alice.address, alice.address, bob.address, 100);
console.log(`✓ Transferred 100 tokens from Alice to Bob`);

const bobTokenBalance = tokenContract.state.balances[bob.address];
console.log(`  Bob's token balance: ${bobTokenBalance} tokens\n`);

// 8. Set contract permissions
console.log('8. Setting contract permissions...');
tokenContract.setPermission('transfer', [alice.address, bob.address]);
console.log(`✓ Only Alice and Bob can execute transfer method\n`);

// 9. Validate blockchain
console.log('9. Validating blockchain...');
const isValid = chain.isChainValid();
console.log(`✓ Blockchain is ${isValid ? 'VALID' : 'INVALID'}\n`);

// 10. Print blockchain summary
console.log('10. Blockchain Summary:');
console.log(`  Total blocks: ${chain.chain.length}`);
console.log(`  Total contracts: ${chain.contracts.length}`);
console.log(`  Pending transactions: ${chain.pendingTransactions.length}`);
console.log(`  Chain valid: ${chain.isChainValid()}`);

console.log('\n=== Detailed Block Information ===');
chain.chain.forEach((block, index) => {
    console.log(`\nBlock #${index}:`);
    console.log(`  Hash: ${block.hash.substring(0, 32)}...`);
    console.log(`  Previous: ${block.previousHash.substring(0, 32)}...`);
    console.log(`  Nonce: ${block.nonce}`);
    console.log(`  Timestamp: ${new Date(block.timestamp).toISOString()}`);
    if (Array.isArray(block.data)) {
        console.log(`  Transactions: ${block.data.length}`);
        block.data.forEach((tx, txIndex) => {
            console.log(`    [${txIndex}] ${tx.from ? tx.from.substring(0, 16) + '...' : 'REWARD'} -> ${tx.to.substring(0, 16)}... (${tx.amount})`);
        });
    } else {
        console.log(`  Data: ${block.data}`);
    }
});

console.log('\n=== Contract Events ===');
tokenContract.getEvents().forEach((event, index) => {
    console.log(`[${index}] ${event.type}: ${event.message || event.method}`);
});

console.log('\n✅ Example completed successfully!');

// Optionally start P2P server
if (process.argv.includes('--p2p')) {
    console.log('\n=== Starting P2P Server ===');
    const p2p = new P2PServer(chain);
    p2p.listen(config.network.p2pPort);
    
    // Connect to peers if specified
    config.network.peers.forEach(peer => {
        console.log(`Connecting to peer: ${peer}`);
        p2p.connectToPeer(peer);
    });
}
