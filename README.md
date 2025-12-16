# Blockchain Application

Una implementazione completa di blockchain in JavaScript con mining, smart contracts, gestione wallet e networking P2P.

## 🚀 Funzionalità

- **Blockchain Management**: Gestione completa della catena di blocchi con Proof of Work
- **Mining**: Sistema di mining con ricompense automatiche
- **Wallet System**: Gestione wallet con crittografia RSA e firma digitale
- **Smart Contracts**: Deploy ed esecuzione di contratti intelligenti
- **P2P Network**: Rete peer-to-peer per sincronizzazione della blockchain
- **REST API**: API completa per interazione con la blockchain
- **Consensus Algorithm**: Algoritmo di consenso per risoluzione conflitti

## 📋 Prerequisiti

- Node.js >= 14.x
- npm >= 6.x

## 🔧 Installazione

```bash
# Clona il repository
git clone <repository-url>
cd special-meme

# Installa le dipendenze
npm install
```

## 🎮 Utilizzo

### Avvio dell'applicazione principale

```bash
npm start
```

### Avvio del server API

```bash
npm run api
```

Il server API sarà disponibile su `http://localhost:3000`

### Esecuzione dei test

```bash
# Esegui tutti i test
npm test

# Esegui i test in modalità watch
npm run test:watch
```

## 📚 API Endpoints

### GET /blocks
Restituisce tutti i blocchi della blockchain

```bash
curl http://localhost:3000/blocks
```

### GET /wallets
Restituisce tutti i wallet salvati

```bash
curl http://localhost:3000/wallets
```

### POST /transaction
Crea una nuova transazione

```bash
curl -X POST http://localhost:3000/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "from": "wallet_address",
    "to": "recipient_address",
    "amount": 10,
    "publicKey": "public_key",
    "signature": "transaction_signature"
  }'
```

## 🏗️ Struttura del Progetto

```
blockchain-app/
├── src/
│   ├── blockchain.js       # Classe principale Blockchain
│   ├── wallet.js           # Gestione wallet e crittografia
│   ├── miner.js           # Logica di mining
│   ├── consensus.js       # Algoritmo di consenso
│   ├── p2p.js             # Server P2P
│   ├── api.js             # REST API
│   ├── index.js           # Applicazione principale
│   ├── smart-contracts/
│   │   └── contract.js    # Smart contracts
│   └── types/
│       └── index.js       # Tipi e interfacce
└── tests/
    └── blockchain.test.js # Test suite
```

## 💡 Esempi d'Uso

### Creare un nuovo wallet

```javascript
const Wallet = require('./blockchain-app/src/wallet');
const myWallet = new Wallet();
console.log(myWallet.address);
```

### Creare e firmare una transazione

```javascript
const tx = {
    from: wallet.address,
    to: recipientAddress,
    amount: 10
};
const signature = wallet.sign(tx);
```

### Deploy di uno Smart Contract

```javascript
const SmartContract = require('./blockchain-app/src/smart-contracts/contract');
const contract = new SmartContract('MyContract', ownerAddress);
contract.deploy({ initialValue: 100 });
blockchain.deployContract(contract);
```

## 🔐 Sicurezza

- Tutte le transazioni sono firmate digitalmente con RSA
- Validazione completa delle transazioni e della blockchain
- Proof of Work per prevenire attacchi spam
- Verifica dell'integrità della catena

## 🧪 Testing

Il progetto include test completi per:
- Validazione della blockchain
- Sistema di mining
- Gestione delle transazioni
- Verifica delle firme

## 📝 Licenza

MIT

## 🤝 Contributing

Le pull request sono benvenute. Per modifiche importanti, apri prima un issue per discutere cosa vorresti cambiare.

## 👥 Autori

- Il tuo nome/team

## 🐛 Bug e Problemi

Per segnalare bug o problemi, apri un issue su GitHub.
