const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const SmartContract = require('./smart-contracts/contract');
const P2PServer = require('./p2p');

const chain = new Blockchain();
const alice = new Wallet();
const bob = new Wallet();

// Deploy a contract
const contract = new SmartContract('SimpleStorage', alice.address);
contract.deploy({ value: 0 });
chain.deployContract(contract);

// Mining iniziale per dare saldo ad Alice
chain.minePendingTransactions(alice.address);

// Alice invia 10 a Bob
const tx = {
    from: alice.address,
    to: bob.address,
    amount: 10,
    publicKey: alice.publicKey,
    signature: alice.sign({ from: alice.address, to: bob.address, amount: 10 })
};
chain.addTransaction(tx);

// Mining della transazione
chain.minePendingTransactions(alice.address);
chain.minePendingTransactions(alice.address);
p2p.broadcastChain();

console.log('Alice balance:', chain.getBalance(alice.address));
console.log('Bob balance:', chain.getBalance(bob.address));
console.log('Chain valid?', chain.isChainValid());
console.log(JSON.stringify(chain.chain, null, 2));

const p2p = new P2PServer(chain);
const PORT = process.env.P2P_PORT || 6001;
p2p.listen(PORT);

// Per connettersi ad altri peer (esempio):
// p2p.connectToPeer('ws://localhost:6002');

// Quando aggiungi una transazione, puoi broadcastarla:
// p2p.broadcastTransaction(tx);

if (process.env.PEERS) {
    process.env.PEERS.split(',').forEach(peer => p2p.connectToPeer(peer));
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.on('line', (input) => {
    const [cmd, ...args] = input.split(' ');
    if (cmd === 'send') {
        const amount = parseInt(args[0]);
        const tx = {
            from: alice.address,
            to: bob.address,
            amount,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount })
        };
        chain.addTransaction(tx);
        p2p.broadcastTransaction(tx);
        console.log('Transaction sent!');
    }
    if (cmd === 'mine') {
        chain.minePendingTransactions(alice.address);
        p2p.broadcastChain();
        console.log('Block mined!');
    }
});