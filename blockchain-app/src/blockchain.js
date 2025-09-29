const crypto = require('crypto');
const SmartContract = require('./smart-contracts/contract');

class Block {
    constructor(index, previousHash, timestamp, data, hash, nonce = 0) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
    }
}

class Blockchain {
    constructor(difficulty = 3) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.pendingTransactions = [];
        this.contracts = [];
    }

    createGenesisBlock() {
        const timestamp = Date.now();
        return new Block(0, "0", timestamp, "Genesis Block", this.calculateHash(0, "0", timestamp, "Genesis Block", 0), 0);
    }

    calculateHash(index, previousHash, timestamp, data, nonce) {
        return crypto.createHash('sha256')
            .update(index + previousHash + timestamp + JSON.stringify(data) + nonce)
            .digest('hex');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if (transaction.from && transaction.signature && transaction.publicKey) {
            const Wallet = require('./wallet');
            // Verifica che l'address sia l'hash della publicKey
            const addressFromPublicKey = crypto.createHash('sha256').update(transaction.publicKey).digest('hex');
            if (transaction.from !== addressFromPublicKey) {
                throw new Error('Address does not match publicKey');
            }
            // Verifica la firma
            const isValid = Wallet.verify(
                { from: transaction.from, to: transaction.to, amount: transaction.amount },
                transaction.signature,
                transaction.publicKey
            );
            if (!isValid) throw new Error('Invalid transaction signature');
            // Controllo saldo
            if (this.getBalance(transaction.from) < transaction.amount) {
                throw new Error('Insufficient balance');
            }
        } else if (transaction.from) {
            // Controllo saldo per reward e transazioni senza firma
            if (this.getBalance(transaction.from) < transaction.amount) {
                throw new Error('Insufficient balance');
            }
        }
        this.pendingTransactions.push(transaction);
    }

    deployContract(contract) {
        this.contracts.push(contract);
    }

    minePendingTransactions(minerAddress) {
        const timestamp = Date.now();
        const data = this.pendingTransactions;
        let nonce = 0;
        let hash;
        const index = this.chain.length;
        const previousHash = this.getLatestBlock().hash;

        do {
            hash = this.calculateHash(index, previousHash, timestamp, data, nonce);
            nonce++;
        } while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0"));

        const block = new Block(index, previousHash, timestamp, data, hash, nonce);
        this.chain.push(block);

        // Ricompensa il miner e mina subito la ricompensa
        this.pendingTransactions = [{
            from: null,
            to: minerAddress,
            amount: 1,
            type: 'reward'
        }];
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== this.calculateHash(
                currentBlock.index,
                currentBlock.previousHash,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.nonce
            )) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    getBalance(address) {
        let balance = 0;
        for (const block of this.chain) {
            if (Array.isArray(block.data)) {
                for (const tx of block.data) {
                    if (tx.from === address) balance -= tx.amount;
                    if (tx.to === address) balance += tx.amount;
                }
            }
        }
        return balance;
    }
}

module.exports = Blockchain;