const Blockchain = require('../src/blockchain');
const Wallet = require('../src/wallet');

describe('Blockchain', () => {
    test('Genesis block is valid', () => {
        const chain = new Blockchain();
        expect(chain.isChainValid()).toBe(true);
    });

    test('Mining and transaction updates balances', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();

        // Primo mining: reward pending
        chain.minePendingTransactions(alice.address);
        // Secondo mining: reward accreditata
        chain.minePendingTransactions(alice.address);

        // Ora Alice ha saldo, può inviare
        const tx = {
            from: alice.address,
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
        };
        chain.addTransaction(tx);

        // Terzo mining: mina la transazione di Alice
        chain.minePendingTransactions(alice.address);

        // Quarto mining: reward della terza mining accreditata
        chain.minePendingTransactions(alice.address);

        expect(chain.getBalance(alice.address)).toBe(3 - 1); // 3 reward, -1 sent
        expect(chain.getBalance(bob.address)).toBe(1);
        expect(chain.isChainValid()).toBe(true);
    });

    test('isChainValid() verifica hash, collegamento e transazioni', () => {
        const chain = new Blockchain();
        const alice = new Wallet();
        const bob = new Wallet();

        // Mining doppio per saldo
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);

        // Crea una transazione valida
        const tx = {
            from: alice.address,
            to: bob.address,
            amount: 1,
            publicKey: alice.publicKey,
            signature: alice.sign({ from: alice.address, to: bob.address, amount: 1 })
        };
        chain.addTransaction(tx);
        chain.minePendingTransactions(alice.address);
        chain.minePendingTransactions(alice.address);

        expect(chain.isChainValid()).toBe(true);

        // Modifica un blocco (hash)
        const originalHash = chain.chain[1].hash;
        chain.chain[1].hash = 'invalid-hash';
        expect(chain.isChainValid()).toBe(false);
        chain.chain[1].hash = originalHash; // Ripristina

        // Modifica un blocco (collegamento)
        const originalPreviousHash = chain.chain[2].previousHash;
        chain.chain[2].previousHash = 'invalid-hash';
        expect(chain.isChainValid()).toBe(false);
        chain.chain[2].previousHash = originalPreviousHash; // Ripristina

        // Modifica una transazione (firma)
        const originalSignature = chain.chain[2].data[0].signature;
        chain.chain[2].data[0].signature = 'invalid-signature';
        expect(chain.isChainValid()).toBe(false);
        chain.chain[2].data[0].signature = originalSignature; // Ripristina
    });
});