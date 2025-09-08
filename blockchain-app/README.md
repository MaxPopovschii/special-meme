# Blockchain Application

This project implements a complete blockchain system in JavaScript, featuring mining, smart contracts, wallet management, and a consensus algorithm.

## Project Structure

```
blockchain-app
├── src
│   ├── blockchain.js        # Defines the Blockchain class for managing the chain of blocks.
│   ├── miner.js            # Contains the Miner class for mining new blocks.
│   ├── wallet.js           # Manages the user's wallet and transactions.
│   ├── consensus.js        # Implements the consensus algorithm for the blockchain.
│   ├── smart-contracts
│   │   └── contract.js     # Defines the SmartContract class for creating and executing smart contracts.
│   └── types
│       └── index.js        # Exports types and interfaces used throughout the project.
├── package.json             # Configuration file for npm, listing dependencies and scripts.
├── .gitignore               # Specifies files and directories to be ignored by Git.
└── README.md                # Documentation for the project.
```

## Features

- **Blockchain Management**: The `Blockchain` class handles the chain of blocks, adding new blocks, and validating the chain.
- **Mining**: The `Miner` class is responsible for mining new blocks and validating transactions.
- **Wallet Management**: The `Wallet` class allows users to create wallets, check balances, and send transactions.
- **Consensus Algorithm**: The `Consensus` class ensures all nodes in the network agree on the state of the blockchain.
- **Smart Contracts**: The `SmartContract` class enables the creation and execution of smart contracts on the blockchain.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd blockchain-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.