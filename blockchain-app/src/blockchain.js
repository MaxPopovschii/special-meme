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
        this.difficulty = difficulty;
        this.pendingTransactions = [];
        this.contracts = [];
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        const timestamp = Date.now();
        const index = 0;
        const previousHash = "0";
        const data = "Genesis Block";
        let nonce = 0;
        let hash;

        // Mine the genesis block
        do {
            hash = this.calculateHash(index, previousHash, timestamp, data, nonce);
            nonce++;
        } while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0"));

        return new Block(index, previousHash, timestamp, data, hash, nonce - 1);
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
        // Inserisci la reward SEMPRE nel blocco minato
        const rewardTx = {
            from: null,
            to: minerAddress,
            amount: 1,
            type: 'reward'
        };

        // Crea il blocco con tutte le pending + reward
        const transactionsToMine = [...this.pendingTransactions, rewardTx];

        const timestamp = Date.now();
        let nonce = 0;
        let hash;
        const index = this.chain.length;
        const previousHash = this.getLatestBlock().hash;

        do {
            hash = this.calculateHash(index, previousHash, timestamp, transactionsToMine, nonce);
            nonce++;
        } while (hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0"));

        const block = new Block(index, previousHash, timestamp, transactionsToMine, hash, nonce - 1);
        this.chain.push(block);

        // Svuota le pending dopo aver minato
        this.pendingTransactions = [];
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Validate block hash
            if (currentBlock.hash !== this.calculateHash(
                currentBlock.index,
                currentBlock.previousHash,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.nonce
            )) {
                return false;
            }

            // Validate block linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            // Validate proof of work
            if (currentBlock.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
                return false;
            }

            // Validate transactions in the block
            if (Array.isArray(currentBlock.data)) {
                for (const tx of currentBlock.data) {
                    // Skip validation for mining rewards (no from address) and reward types
                    if (!tx.from || tx.type === 'reward') continue;

                    // Validate signature if present (should be present for user transactions)
                    if (tx.signature && tx.publicKey) {
                        const Wallet = require('./wallet');
                        const addressFromPublicKey = crypto.createHash('sha256').update(tx.publicKey).digest('hex');
                        
                        // Check if address matches public key
                        if (tx.from !== addressFromPublicKey) {
                            return false;
                        }

                        // Verify signature
                        const isValid = Wallet.verify(
                            { from: tx.from, to: tx.to, amount: tx.amount },
                            tx.signature,
                            tx.publicKey
                        );
                        if (!isValid) {
                            return false;
                        }
                    }
                }
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