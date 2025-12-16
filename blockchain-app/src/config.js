// Configuration file for blockchain application

module.exports = {
    // Blockchain settings
    blockchain: {
        difficulty: 3,              // Mining difficulty (number of leading zeros)
        miningReward: 1,            // Reward for mining a block
        maxTransactionsPerBlock: 100 // Maximum transactions per block
    },

    // Network settings
    network: {
        apiPort: 3000,              // REST API port
        p2pPort: 6001,              // P2P server port
        peers: [                    // Initial peer addresses to connect to
            // 'ws://localhost:6002',
            // 'ws://localhost:6003'
        ]
    },

    // Wallet settings
    wallet: {
        keySize: 512,               // RSA key size in bits
        algorithm: 'rsa',           // Key generation algorithm
        hashAlgorithm: 'sha256'     // Hash algorithm for addresses
    },

    // Mining settings
    mining: {
        autoMine: false,            // Automatically mine when transactions are added
        miningInterval: 10000       // Auto-mining interval in milliseconds (if enabled)
    },

    // Storage settings
    storage: {
        walletsFile: 'wallets.json',
        chainFile: 'blockchain.json',
        enablePersistence: false    // Save blockchain to disk
    },

    // Logging settings
    logging: {
        level: 'info',              // Log level: 'debug', 'info', 'warn', 'error'
        enableConsole: true,        // Enable console logging
        enableFile: false,          // Enable file logging
        logFile: 'blockchain.log'   // Log file path
    }
};
