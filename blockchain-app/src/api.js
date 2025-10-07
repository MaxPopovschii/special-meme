const express = require('express');
const app = express();
const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const SmartContract = require('./smart-contracts/contract');
const fs = require('fs');

const chain = new Blockchain();
app.use(express.json());

app.get('/blocks', (req, res) => res.json(chain.chain));
app.get('/wallets', (req, res) => {
    if (fs.existsSync('wallets.json')) {
        res.json(JSON.parse(fs.readFileSync('wallets.json', 'utf8')));
    } else {
        res.json([]);
    }
});
app.post('/transaction', (req, res) => {
    try {
        chain.addTransaction(req.body);
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
app.listen(3000, () => console.log('API listening on port 3000'));