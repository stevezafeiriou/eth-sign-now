# Eth Sign Now

A full-stack Ethereum “message signing & broadcasting” dApp built with Hardhat, Ethers.js, and React. Users can sign arbitrary messages off-chain, then (if they’re the contract owner) broadcast them on-chain. Each signed message can be exported as a PNG “promise card” with generative pixel art.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repo](#1-clone-the-repo)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Compile & deploy contracts](#3-compile--deploy-contracts)
  - [4. Frontend setup](#4-frontend-setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Connecting your wallet](#connecting-your-wallet)
  - [Signing a message](#signing-a-message)
  - [Broadcasting on-chain](#broadcasting-on-chain)
  - [Exporting Promise Cards](#exporting-promise-cards)
- [Folder Structure](#folder-structure)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Smart Contract**
  - Only owner can store signed messages
  - Emits `MessageSigned(address signer, string message, bytes signature)`
- **React Frontend**
  - Connect/Disconnect MetaMask
  - Off-chain message signing
  - On-chain broadcast with toast notifications
  - “Promise card” image export with generative pixel art
- **Pixel Art Generator**
  - 12×12 grid, rare blue accents
  - Fully deterministic per-signature hash
- **Responsive UI**
  - Frosted-glass components, dark/light theme support

## Prerequisites

- Node.js ≥ v18 (or v20 recommended)
- npm ≥ 9 or yarn ≥ 1.22
- A local Hardhat network or your preferred Ethereum network
- MetaMask (or another EIP-1193 wallet)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/eth-sign-now.git
cd eth-sign-now
```

### 2. Install dependencies

```bash
# From the root directory
npm install
# or
yarn install
```

### 3. Compile & deploy contracts

```bash
# Compile the Solidity smart contract
npx hardhat compile

# (Optional) Run tests
npx hardhat test

# Deploy to your local Hardhat node
npx hardhat node
# In a new terminal:
npx hardhat run scripts/deploy.js --network localhost
```

**_Note:_**

- Update the deployed address in `src/hooks/useEthereum.js` under `CONTRACT_ADDRESS`.
- If you deploy to a public testnet/mainnet, adjust `--network` and add your keys to `.env`.

### 4. Frontend setup

```bash
cd client
npm start
# or
yarn start
```

Your React app will be running at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` in the repo root with any of:

```ini
# For public testnets / mainnet deployments
RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_deployer_private_key
```

Then update Hardhat’s `hardhat.config.js` to load these with `dotenv`.

## Usage

### Connecting your wallet

1. Click **Connect Wallet** in the navbar.
2. Approve the connection request in MetaMask.

### Signing a message

1. In the **Your Message** textarea, type your promise or message.
2. Click **Sign**.
3. A toast confirms off-chain signature.

### Broadcasting on-chain

1. Once signed, click **Broadcast**.
2. A toast shows pending/confirmed states.
3. On confirmation, the message appears in **Past Messages**.

### Exporting Promise Cards

1. In **Past Messages**, click the share icon on a row.
2. A fullscreen modal opens with your promise + signature card.
3. Click **Download Image** to save the 800×800 PNG.

## Folder Structure

```
eth-sign-now/
├─ contracts/            # Solidity sources & Hardhat config
│  ├─ contracts/
│  ├─ scripts/
│  ├─ test/
│  └─ hardhat.config.js
├─ client/               # React frontend
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ styles/
│  │  └─ utils/           # hashArt, identicon, etc.
│  ├─ .env
│  └─ package.json
├─ .gitignore
└─ README.md
```

## Customization

- **Contract Logic**: Tweak `contracts/Signatures.sol`.
- **Pixel Art**: Edit `client/src/utils/hashArt.js` (grid size, palette).
- **Styling**: Modify `client/src/styles` or `tailwind.config.js`.
- **Notifications**: Adjust `react-toastify` settings in `App.jsx`.

## Troubleshooting

- **“could not detect network”**

  - Confirm `RPC_URL` matches your running node (e.g. `http://127.0.0.1:8545`).

- **MetaMask connection fails**

  - Ensure your React app is served over HTTP(S) matching your wallet network.

- **Artifacts not found**

  - Run `npx hardhat compile` in the project root.

## License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for details.
