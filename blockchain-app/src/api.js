const express = require('express');
const app = express();
const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const SmartContract = require('./smart-contracts/contract');
const fs = require('fs');

const chain = new Blockchain();
app.use(express.json());

// Get all blocks
app.get('/blocks', (req, res) => {
    res.json({
        blocks: chain.chain,
        length: chain.chain.length,
        valid: chain.isChainValid()
    });
});

// Get a specific block by index
app.get('/blocks/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < chain.chain.length) {
        res.json(chain.chain[index]);
    } else {
        res.status(404).json({ error: 'Block not found' });
    }
});

// Get all wallets
app.get('/wallets', (req, res) => {
    if (fs.existsSync('wallets.json')) {
        res.json(JSON.parse(fs.readFileSync('wallets.json', 'utf8')));
    } else {
        res.json([]);
    }
});

// Create a new wallet
app.post('/wallet', (req, res) => {
    try {
        const wallet = new Wallet();
        const walletData = {
            address: wallet.address,
            publicKey: wallet.publicKey,
            balance: chain.getBalance(wallet.address)
        };
        
        // Save wallet to file (in production use a database)
        let wallets = [];
        if (fs.existsSync('wallets.json')) {
            wallets = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
        }
        wallets.push({
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey // WARNING: In production, never store private keys on server!
        });
        fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));
        
        res.json(walletData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get balance for an address
app.get('/balance/:address', (req, res) => {
    try {
        const balance = chain.getBalance(req.params.address);
        res.json({ address: req.params.address, balance });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Get all transactions for an address
app.get('/transactions/:address', (req, res) => {
    try {
        const address = req.params.address;
        const transactions = [];
        
        chain.chain.forEach(block => {
            if (Array.isArray(block.data)) {
                block.data.forEach(tx => {
                    if (tx.from === address || tx.to === address) {
                        transactions.push({
                            blockIndex: block.index,
                            from: tx.from,
                            to: tx.to,
                            amount: tx.amount,
                            timestamp: block.timestamp
                        });
                    }
                });
            }
        });
        
        res.json({ address, transactions, count: transactions.length });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Add a new transaction
app.post('/transaction', (req, res) => {
    try {
        chain.addTransaction(req.body);
        res.json({ 
            status: 'ok', 
            message: 'Transaction added to pending pool',
            pendingTransactions: chain.pendingTransactions.length
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Get pending transactions
app.get('/transactions/pending', (req, res) => {
    res.json({
        pendingTransactions: chain.pendingTransactions,
        count: chain.pendingTransactions.length
    });
});

// Mine pending transactions
app.post('/mine', (req, res) => {
    try {
        const { minerAddress } = req.body;
        
        if (!minerAddress) {
            return res.status(400).json({ error: 'Miner address is required' });
        }
        
        const previousLength = chain.chain.length;
        chain.minePendingTransactions(minerAddress);
        
        res.json({
            status: 'ok',
            message: 'Block mined successfully',
            block: chain.getLatestBlock(),
            chainLength: chain.chain.length,
            blocksMined: chain.chain.length - previousLength
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Deploy a smart contract
app.post('/contract/deploy', (req, res) => {
    try {
        const { name, owner, initialState } = req.body;
        
        if (!name || !owner) {
            return res.status(400).json({ error: 'Contract name and owner are required' });
        }
        
        const contract = new SmartContract(name, owner);
        contract.deploy(initialState || {});
        chain.deployContract(contract);
        
        res.json({
            status: 'ok',
            message: 'Contract deployed successfully',
            contract: {
                name: contract.name,
                owner: contract.owner,
                state: contract.state
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all deployed contracts
app.get('/contracts', (req, res) => {
    res.json({
        contracts: chain.contracts.map(c => ({
            name: c.name,
            owner: c.owner,
            state: c.state,
            events: c.events
        })),
        count: chain.contracts.length
    });
});

// Execute contract method
app.post('/contract/:name/execute', (req, res) => {
    try {
        const { name } = req.params;
        const { method, args } = req.body;
        
        const contract = chain.contracts.find(c => c.name === name);
        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        
        const result = contract.execute(method, ...(args || []));
        
        res.json({
            status: 'ok',
            result,
            state: contract.state
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Check if chain is valid
app.get('/validate', (req, res) => {
    res.json({
        valid: chain.isChainValid(),
        chainLength: chain.chain.length
    });
});

app.listen(3000, () => console.log('API listening on port 3000'));

module.exports = app;