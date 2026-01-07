# VeriFi Protocol

Next-Generation Event Ticketing on Arbitrum using Zero-Knowledge Proofs.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- Git

### 2. Setup

```bash
# Install dependencies
cd contracts && npm install
cd ../circuits && npm install
cd ../frontend && npm install
```

### 3. Smart Contracts (Local)

```bash
cd contracts
npx hardhat node
# In a new terminal:
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Frontend

```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🏗 Architecture
- **Contracts**: Hardhat + Solidity
- **Frontend**: Next.js 15 + Wagmi
- **Privacy**: Circom + SnarkJS

## 🔑 Key Features
1. **Create Events**: Organizers launch events with automated royalties.
2. **Buy Tickets**: Users mint NFT tickets w/ private commitments.
3. **ZK Check-In**: Prove attendance without revealing identity.
4. **Marketplace**: Resell tickets securely.
