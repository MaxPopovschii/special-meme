const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const SmartContract = require('./smart-contracts/contract');

const chain = new Blockchain();
const alice = new Wallet();
const bob = new Wallet();

// Deploy a contract
const contract = new SmartContract('SimpleStorage', alice.address);
contract.deploy({ value: 0 });
chain.deployContract(contract);

// Alice invia 10 a Bob
const tx = {
    from: alice.address,
    to: bob.address,
    amount: 10,
    signature: alice.sign({ from: alice.address, to: bob.address, amount: 10 })
};
chain.addTransaction(tx);

// Mining
chain.minePendingTransactions(alice.address);

console.log('Alice balance:', chain.getBalance(alice.address));
console.log('Bob balance:', chain.getBalance(bob.address));
console.log('Chain valid?', chain.isChainValid());