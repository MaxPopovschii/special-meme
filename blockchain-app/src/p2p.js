const WebSocket = require('ws');

class P2PServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen(port) {
        const server = new WebSocket.Server({ port });
        server.on('connection', ws => this.connectSocket(ws));
        server.on('error', (error) => {
            console.error(`P2P server error: ${error.message}`);
        });
        console.log(`P2P server listening on port ${port}`);
    }

    connectSocket(ws) {
        this.sockets.push(ws);
        console.log(`New peer connected. Total peers: ${this.sockets.length}`);
        
        ws.on('message', message => {
            try {
                this.handleMessage(ws, message);
            } catch (error) {
                console.error(`Error handling message: ${error.message}`);
                this.sendError(ws, error.message);
            }
        });
        
        ws.on('close', () => {
            this.sockets = this.sockets.filter(s => s !== ws);
            console.log(`Peer disconnected. Total peers: ${this.sockets.length}`);
        });
        
        ws.on('error', (error) => {
            console.error(`WebSocket error: ${error.message}`);
            this.sockets = this.sockets.filter(s => s !== ws);
        });
        
        this.sendChain(ws);
    }

    handleMessage(ws, message) {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'CHAIN':
                this.handleChainMessage(data);
                break;
            case 'TX':
                this.handleTransactionMessage(data);
                break;
            case 'BLOCK':
                this.handleBlockMessage(data);
                break;
            case 'REQUEST_CHAIN':
                this.sendChain(ws);
                break;
            default:
                console.warn(`Unknown message type: ${data.type}`);
        }
    }

    handleChainMessage(data) {
        try {
            if (data.chain && Array.isArray(data.chain)) {
                if (data.chain.length > this.blockchain.chain.length) {
                    // Create a temporary blockchain to validate the incoming chain
                    const tempBlockchain = Object.assign(Object.create(Object.getPrototypeOf(this.blockchain)), this.blockchain);
                    tempBlockchain.chain = data.chain;
                    
                    if (tempBlockchain.isChainValid()) {
                        this.blockchain.chain = data.chain;
                        console.log(`Chain updated to length ${this.blockchain.chain.length}`);
                    } else {
                        console.warn('Received invalid chain, rejecting');
                    }
                } else {
                    console.log('Received chain is not longer, ignoring');
                }
            }
        } catch (error) {
            console.error(`Error processing chain: ${error.message}`);
        }
    }

    handleTransactionMessage(data) {
        try {
            if (data.tx) {
                this.blockchain.addTransaction(data.tx);
                console.log(`Transaction added from peer: ${data.tx.from} -> ${data.tx.to}`);
            }
        } catch (error) {
            console.error(`Error processing transaction: ${error.message}`);
        }
    }

    handleBlockMessage(data) {
        try {
            if (data.block) {
                // Validate and potentially add the new block
                const latestBlock = this.blockchain.getLatestBlock();
                if (data.block.index === latestBlock.index + 1 && 
                    data.block.previousHash === latestBlock.hash) {
                    this.blockchain.chain.push(data.block);
                    console.log(`New block added: ${data.block.index}`);
                } else {
                    console.log('Block rejected: invalid index or previousHash');
                    // Request full chain if out of sync
                    this.requestChain();
                }
            }
        } catch (error) {
            console.error(`Error processing block: ${error.message}`);
        }
    }

    sendChain(ws) {
        try {
            ws.send(JSON.stringify({ 
                type: 'CHAIN', 
                chain: this.blockchain.chain,
                length: this.blockchain.chain.length
            }));
        } catch (error) {
            console.error(`Error sending chain: ${error.message}`);
        }
    }

    sendError(ws, message) {
        try {
            ws.send(JSON.stringify({ type: 'ERROR', message }));
        } catch (error) {
            console.error(`Error sending error message: ${error.message}`);
        }
    }

    broadcastTransaction(tx) {
        this.broadcast({ type: 'TX', tx });
        console.log(`Transaction broadcasted to ${this.sockets.length} peers`);
    }

    broadcastChain() {
        this.broadcast({ 
            type: 'CHAIN', 
            chain: this.blockchain.chain,
            length: this.blockchain.chain.length
        });
        console.log(`Chain broadcasted to ${this.sockets.length} peers`);
    }

    broadcastBlock(block) {
        this.broadcast({ type: 'BLOCK', block });
        console.log(`Block broadcasted to ${this.sockets.length} peers`);
    }

    broadcast(data) {
        const message = JSON.stringify(data);
        this.sockets.forEach(ws => {
            try {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(message);
                }
            } catch (error) {
                console.error(`Error broadcasting to peer: ${error.message}`);
            }
        });
    }

    requestChain() {
        this.broadcast({ type: 'REQUEST_CHAIN' });
    }

    connectToPeer(address) {
        try {
            const ws = new WebSocket(address);
            
            ws.on('open', () => {
                console.log(`Connected to peer: ${address}`);
                this.connectSocket(ws);
            });
            
            ws.on('error', (error) => {
                console.error(`Failed to connect to peer ${address}: ${error.message}`);
            });
        } catch (error) {
            console.error(`Error connecting to peer ${address}: ${error.message}`);
        }
    }

    getPeersInfo() {
        return this.sockets.map((ws, index) => ({
            index,
            readyState: ws.readyState,
            connected: ws.readyState === WebSocket.OPEN
        }));
    }
}

module.exports = P2PServer;