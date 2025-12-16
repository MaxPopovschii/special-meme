# Test Instructions

## Running Tests

```bash
# Install dependencies (if not already done)
npm install

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run validation script
node validate.js
```

## Expected Results

All tests should pass:
- ✓ Wallet tests (6 tests)
- ✓ Smart Contract tests (14 tests)
- ✓ Transaction Validation tests (7 tests)  
- ✓ Blockchain tests (3 tests)

Total: 31 tests passing

## Manual Testing

### Test the API

```bash
# Start the API server
npm run api

# In another terminal, test endpoints:

# Get blockchain
curl http://localhost:3000/blocks

# Create a wallet
curl -X POST http://localhost:3000/wallet

# Get balance
curl http://localhost:3000/balance/YOUR_ADDRESS

# Mine a block
curl -X POST http://localhost:3000/mine \
  -H "Content-Type: application/json" \
  -d '{"minerAddress":"YOUR_ADDRESS"}'
```

### Test the Application

```bash
# Run the main application
npm start
```

## Troubleshooting

If tests fail:
1. Make sure all dependencies are installed: `npm install`
2. Check that Node.js version is >= 14.x
3. Clear any cached blockchain data: `rm -f wallets.json blockchain.json`
4. Run validation script to debug: `node validate.js`
