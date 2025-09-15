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

// Alice invia 10 a Bob
const tx = {
    from: alice.publicKey, // trasmetti la publicKey
    to: bob.address,
    amount: 10,
    signature: alice.sign({ from: alice.publicKey, to: bob.address, amount: 10 })
};
chain.addTransaction(tx);

// Mining
chain.minePendingTransactions(alice.address);
// Mina anche la transazione di ricompensa
chain.minePendingTransactions(alice.address);

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