const WebSocket = require('ws');

class P2PServer {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.sockets = [];
    }

    listen(port) {
        const server = new WebSocket.Server({ port });
        server.on('connection', ws => this.connectSocket(ws));
        console.log(`P2P server listening on port ${port}`);
    }

    connectSocket(ws) {
        this.sockets.push(ws);
        ws.on('message', message => this.handleMessage(ws, message));
        this.sendChain(ws);
    }

    handleMessage(ws, message) {
        const data = JSON.parse(message);
        if (data.type === 'CHAIN') {
            if (data.chain.length > this.blockchain.chain.length && this.blockchain.isChainValid()) {
                this.blockchain.chain = data.chain;
            }
        } else if (data.type === 'TX') {
            this.blockchain.addTransaction(data.tx);
        }
    }

    sendChain(ws) {
        ws.send(JSON.stringify({ type: 'CHAIN', chain: this.blockchain.chain }));
    }

    broadcastTransaction(tx) {
        this.sockets.forEach(ws => ws.send(JSON.stringify({ type: 'TX', tx })));
    }

    connectToPeer(address) {
        const ws = new WebSocket(address);
        ws.on('open', () => this.connectSocket(ws));
    }
}

module.exports = P2PServer;