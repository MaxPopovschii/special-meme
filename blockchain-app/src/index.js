const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const SmartContract = require('./smart-contracts/contract');
const P2PServer = require('./p2p');
const fs = require('fs');

const chain = new Blockchain();
const alice = new Wallet();
const bob = new Wallet();
const carol = new Wallet();

function printStatus(chain, wallets) {
    console.log('\n--- Blockchain Status ---');
    console.log('Blocks:', chain.chain.length);
    wallets.forEach(w => {
        console.log(`${w.address}: ${chain.getBalance(w.address)}`);
    });
    console.log('Pending transactions:', chain.pendingTransactions.length);
    console.log('Chain valid?', chain.isChainValid());
}

function randomTransaction(wallets) {
    const shuffled = wallets.sort(() => 0.5 - Math.random());
    const [from, to] = shuffled.slice(0, 2);
    const amount = Math.floor(Math.random() * 5) + 1;
    if (chain.getBalance(from.address) >= amount) {
        const tx = {
            from: from.address,
            to: to.address,
            amount,
            publicKey: from.publicKey,
            signature: from.sign({ from: from.address, to: to.address, amount })
        };
        chain.addTransaction(tx);
        p2p.broadcastTransaction(tx);
        console.log(`Simulated TX: ${from.address} -> ${to.address} (${amount})`);
    }
}

function printLastBlock(chain) {
    const lastBlock = chain.getLatestBlock();
    console.log('\n--- Last Block ---');
    console.log('Index:', lastBlock.index);
    console.log('Hash:', lastBlock.hash);
    console.log('Transactions:', JSON.stringify(lastBlock.data, null, 2));
}

function printAllBlocks(chain) {
    console.log('\n--- Blockchain ---');
    chain.chain.forEach(block => {
        console.log(`Block #${block.index} | Hash: ${block.hash} | TXs: ${Array.isArray(block.data) ? block.data.length : 0}`);
    });
}

function printWalletTransactions(chain, walletAddress) {
    console.log(`\n--- Transactions for ${walletAddress} ---`);
    chain.chain.forEach(block => {
        if (Array.isArray(block.data)) {
            block.data.forEach(tx => {
                if (tx.from === walletAddress || tx.to === walletAddress) {
                    console.log(`Block #${block.index} | From: ${tx.from} | To: ${tx.to} | Amount: ${tx.amount}`);
                }
            });
        }
    });
}

function printPendingTransactions(chain) {
    console.log('\n--- Pending Transactions ---');
    if (chain.pendingTransactions.length === 0) {
        console.log('No pending transactions.');
        return;
    }
    chain.pendingTransactions.forEach((tx, idx) => {
        console.log(`TX #${idx + 1} | From: ${tx.from} | To: ${tx.to} | Amount: ${tx.amount}`);
    });
}

function printPeers(p2p) {
    console.log('\n--- Connected Peers ---');
    if (!p2p.sockets || p2p.sockets.length === 0) {
        console.log('No peers connected.');
        return;
    }
    p2p.sockets.forEach((ws, idx) => {
        if (ws._socket && ws._socket.remoteAddress) {
            console.log(`Peer #${idx + 1}: ${ws._socket.remoteAddress}:${ws._socket.remotePort}`);
        } else {
            console.log(`Peer #${idx + 1}: Connected`);
        }
    });
}

function printContracts(chain) {
    console.log('\n--- Deployed Smart Contracts ---');
    if (!chain.contracts || chain.contracts.length === 0) {
        console.log('No contracts deployed.');
        return;
    }
    chain.contracts.forEach((contract, idx) => {
        console.log(`Contract #${idx + 1}: ${contract.name} | Owner: ${contract.owner}`);
        console.log('State:', JSON.stringify(contract.state, null, 2));
        console.log('Events:', contract.getEvents().join('; '));
    });
}

function printContractEvents(chain, contractIdx) {
    const contract = chain.contracts[contractIdx];
    if (!contract) {
        console.log('Invalid contract index.');
        return;
    }
    console.log(`\n--- Events for Contract #${contractIdx + 1} (${contract.name}) ---`);
    const events = contract.getEvents();
    if (!events || events.length === 0) {
        console.log('No events.');
        return;
    }
    events.forEach((event, idx) => {
        console.log(`Event #${idx + 1}: ${event}`);
    });
}

function exportBlockchain(chain, filename = 'blockchain_export.json') {
    fs.writeFileSync(filename, JSON.stringify(chain.chain, null, 2));
    console.log(`Blockchain exported to ${filename}`);
}

function importBlockchain(chain, filename = 'blockchain_export.json') {
    if (!fs.existsSync(filename)) {
        console.log(`File ${filename} not found.`);
        return;
    }
    const data = fs.readFileSync(filename, 'utf8');
    try {
        const blocks = JSON.parse(data);
        if (!Array.isArray(blocks)) {
            console.log('Invalid blockchain format.');
            return;
        }
        chain.chain = blocks;
        console.log(`Blockchain imported from ${filename}`);
    } catch (e) {
        console.log('Error importing blockchain:', e.message);
    }
}

function saveState() {
    fs.writeFileSync('chain.json', JSON.stringify(chain.chain, null, 2));
    fs.writeFileSync('wallets.json', JSON.stringify(wallets.map(w => ({
        address: w.address,
        publicKey: w.publicKey
    })), null, 2));
    fs.writeFileSync('contracts.json', JSON.stringify(chain.contracts.map(c => ({
        name: c.name,
        owner: c.owner,
        state: c.state,
        events: c.events
    })), null, 2));
    fs.writeFileSync('pending.json', JSON.stringify(chain.pendingTransactions, null, 2));
}

function loadState() {
    if (fs.existsSync('chain.json')) {
        chain.chain = JSON.parse(fs.readFileSync('chain.json', 'utf8'));
    }
    if (fs.existsSync('wallets.json')) {
        const loadedWallets = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
        loadedWallets.forEach(w => {
            const wallet = new Wallet();
            wallet.address = w.address;
            wallet.publicKey = w.publicKey;
            wallets.push(wallet);
        });
    }
    if (fs.existsSync('contracts.json')) {
        const loadedContracts = JSON.parse(fs.readFileSync('contracts.json', 'utf8'));
        loadedContracts.forEach(c => {
            const contract = new SmartContract(c.name, c.owner);
            contract.state = c.state;
            contract.events = c.events;
            chain.contracts.push(contract);
        });
    }
    if (fs.existsSync('pending.json')) {
        chain.pendingTransactions = JSON.parse(fs.readFileSync('pending.json', 'utf8'));
    }
}

// Mining iniziale per dare saldo ai wallet
chain.minePendingTransactions(alice.address);
chain.minePendingTransactions(bob.address);
chain.minePendingTransactions(carol.address);

const wallets = [alice, bob, carol];

// Simulazione automatica ogni 10 secondi
setInterval(() => {
    randomTransaction(wallets);
    chain.minePendingTransactions(wallets[Math.floor(Math.random() * wallets.length)].address);
    printStatus(chain, wallets);
}, 10000);

printStatus(chain, wallets);

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

function printStats(chain) {
    let txCount = 0;
    let totalValue = 0;
    chain.chain.forEach(block => {
        if (Array.isArray(block.data)) {
            block.data.forEach(tx => {
                if (typeof tx.amount === 'number') {
                    txCount++;
                    totalValue += tx.amount;
                }
            });
        }
    });
    console.log('\n--- Blockchain Stats ---');
    console.log('Total blocks:', chain.chain.length);
    console.log('Total transactions:', txCount);
    console.log('Total value transferred:', totalValue);
}

function printWallets(wallets) {
    console.log('\n--- Wallets ---');
    wallets.forEach((w, idx) => {
        console.log(`Wallet #${idx + 1}:`);
        console.log(`  Address: ${w.address}`);
        console.log(`  PublicKey: ${w.publicKey}`);
        console.log(`  Balance: ${chain.getBalance(w.address)}`);
    });
}

readline.on('line', (input) => {
    const [cmd, ...args] = input.split(' ');
    if (cmd === 'send') {
        // send <from> <to> <amount>
        const fromName = args[0];
        const toName = args[1];
        const amount = parseInt(args[2]);
        const fromWallet = wallets.find(w => w.address.endsWith(fromName));
        const toWallet = wallets.find(w => w.address.endsWith(toName));
        if (!fromWallet || !toWallet) {
            console.log('Invalid wallet name. Use last 6 chars of address as name.');
            return;
        }
        if (chain.getBalance(fromWallet.address) < amount) {
            console.log('Insufficient balance.');
            return;
        }
        const tx = {
            from: fromWallet.address,
            to: toWallet.address,
            amount,
            publicKey: fromWallet.publicKey,
            signature: fromWallet.sign({ from: fromWallet.address, to: toWallet.address, amount })
        };
        chain.addTransaction(tx);
        p2p.broadcastTransaction(tx);
        console.log('Transaction sent!');
    }
    if (cmd === 'mine') {
        chain.minePendingTransactions(wallets[Math.floor(Math.random() * wallets.length)].address);
        p2p.broadcastChain();
        console.log('Block mined!');
        printLastBlock(chain);
    }
    if (cmd === 'status') {
        printStatus(chain, wallets);
    }
    if (cmd === 'blocks') {
        printAllBlocks(chain);
    }
    if (cmd === 'txs') {
        // txs <wallet_suffix>
        const wallet = wallets.find(w => w.address.endsWith(args[0]));
        if (!wallet) {
            console.log('Invalid wallet name. Use last 6 chars of address as name.');
            return;
        }
        printWalletTransactions(chain, wallet.address);
    }
    if (cmd === 'pending') {
        printPendingTransactions(chain);
    }
    if (cmd === 'peers') {
        printPeers(p2p);
    }
    if (cmd === 'contracts') {
        printContracts(chain);
    }
    if (cmd === 'deploy') {
        // deploy <contract_name> <owner_suffix> <initial_value>
        const contractName = args[0];
        const ownerWallet = wallets.find(w => w.address.endsWith(args[1]));
        const initialValue = args[2] ? parseInt(args[2]) : 0;
        if (!contractName || !ownerWallet) {
            console.log('Usage: deploy <contract_name> <owner_suffix> <initial_value>');
            return;
        }
        const contract = new SmartContract(contractName, ownerWallet.address);
        contract.deploy({ value: initialValue });
        chain.deployContract(contract);
        console.log(`Contract "${contractName}" deployed by ${ownerWallet.address} with initial value ${initialValue}`);
    }
    if (cmd === 'call') {
        // call <contract_idx> <method> <args...>
        const contractIdx = parseInt(args[0]) - 1;
        const method = args[1];
        const methodArgs = args.slice(2);
        const contract = chain.contracts[contractIdx];
        if (!contract) {
            console.log('Invalid contract index.');
            return;
        }
        try {
            const result = contract.execute(method, ...methodArgs);
            console.log(`Result:`, result);
            console.log('Events:', contract.getEvents().join('; '));
        } catch (e) {
            console.log('Error:', e.message);
        }
    }
    if (cmd === 'events') {
        // events <contract_idx>
        const contractIdx = parseInt(args[0]) - 1;
        printContractEvents(chain, contractIdx);
    }
    if (cmd === 'export') {
        // export [filename]
        const filename = args[0] || 'blockchain_export.json';
        exportBlockchain(chain, filename);
    }
    if (cmd === 'import') {
        // import [filename]
        const filename = args[0] || 'blockchain_export.json';
        importBlockchain(chain, filename);
    }
    if (cmd === 'stats') {
        printStats(chain);
    }
    if (cmd === 'newwallet') {
        // newwallet <name>
        const name = args[0] || `wallet${wallets.length + 1}`;
        const wallet = new Wallet();
        wallets.push(wallet);
        console.log(`New wallet created: ${name}`);
        console.log(`Address: ${wallet.address}`);
        console.log(`PublicKey: ${wallet.publicKey}`);
        // Mining iniziale per dare saldo al nuovo wallet
        chain.minePendingTransactions(wallet.address);
    }
    if (cmd === 'wallets') {
        printWallets(wallets);
    }
});

// All'avvio
loadState();
// Dopo ogni modifica
setInterval(saveState, 10000);

const log = (msg) => {
    const ts = new Date().toISOString();
    fs.appendFileSync('blockchain.log', `[${ts}] ${msg}\n`);
};
// Usa log() per eventi importanti
log('Blockchain node started');