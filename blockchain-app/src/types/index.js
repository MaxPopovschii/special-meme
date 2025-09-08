export class Transaction {
    constructor(sender, recipient, amount) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.timestamp = Date.now();
    }
}

export class Block {
    constructor(index, previousHash, timestamp, transactions, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = nonce;
    }
}

export class Wallet {
    constructor() {
        this.balance = 0;
        this.transactions = [];
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }
}