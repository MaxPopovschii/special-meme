const Blockchain = require('../src/blockchain');
const Wallet = require('../src/wallet');

describe('Transaction Validation', () => {
    test('Reject transaction with insufficient balance', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();
        
        // Alice has no balance yet
        const tx = {
            from: alice.address,
            to: bob.address,
            amount: 10,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount: 10 })
        };
        
        expect(() => chain.addTransaction(tx)).toThrow('Insufficient balance');
    });

    test('Reject transaction with invalid signature', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();
        
        // Give Alice some balance
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        
        const tx = {
            from: alice.address,
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: 'invalid-signature'
        };
        
        expect(() => chain.addTransaction(tx)).toThrow('Invalid transaction signature');
    });

    test('Reject transaction with mismatched address and publicKey', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();
        
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        
        const tx = {
            from: 'wrong-address',
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: 'wrong-address', to: bob.address, amount: 1 })
        };
        
        expect(() => chain.addTransaction(tx)).toThrow('Address does not match publicKey');
    });

    test('Accept valid signed transaction', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();
        
        // Give Alice balance
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        
        const tx = {
            from: alice.address,
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
        };
        
        expect(() => chain.addTransaction(tx)).not.toThrow();
        expect(chain.pendingTransactions.length).toBe(1);
    });

    test('Chain validation detects invalid transaction signature', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();
        
        // Give Alice balance
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        
        // Add valid transaction
        const tx = {
            from: alice.address,
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
        };
        chain.addTransaction(tx);
        chain.minePendingTransactions(alice.address);
        
        expect(chain.isChainValid()).toBe(true);
        
        // Tamper with a transaction signature
        const blockWithTx = chain.chain.find(b => 
            Array.isArray(b.data) && b.data.some(t => t.from === alice.address)
        );
        const txIndex = blockWithTx.data.findIndex(t => t.from === alice.address);
        blockWithTx.data[txIndex].signature = 'tampered-signature';
        
        expect(chain.isChainValid()).toBe(false);
    });

    test('Chain validation passes for mining rewards without signature', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        
        expect(chain.isChainValid()).toBe(true);
    });

    test('Multiple transactions in single block are all validated', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();
        const carol = new Wallet();
        
        // Give Alice balance
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);
        
        // Add multiple transactions
        const tx1 = {
            from: alice.address,
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
        };
        const tx2 = {
            from: alice.address,
            to: carol.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: carol.address, amount: 1 })
        };
        
        chain.addTransaction(tx1);
        chain.addTransaction(tx2);
        chain.minePendingTransactions(alice.address);
        
        expect(chain.isChainValid()).toBe(true);
        expect(chain.getBalance(bob.address)).toBe(1);
        expect(chain.getBalance(carol.address)).toBe(1);
    });
});
