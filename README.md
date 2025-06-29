# Eth Sign Now

A full-stack Ethereum “message signing & broadcasting” dApp built with Hardhat, Ethers.js, and React. Users can sign arbitrary messages off-chain, then (if permitted) broadcast them on-chain. Each signed message can be exported as a PNG “promise card” with generative pixel art.

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
  - [Toggling Contract “Open” State](#toggling-contract-open-state)
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
  - Only owner can record messages when _closed_; when _open_, any signer with a valid signature may call
  - Owner can toggle the `open` flag via `setOpen(bool)`
  - Emits `MessageSigned(address signer, string message, bytes signature)` and `OpenToggled(bool open)`
- **React Frontend**
  - Connect/Disconnect MetaMask
  - Owner UI shows `Open`/`Closed` state and a toggle button
  - Off-chain message signing
  - On-chain broadcast with promise-style toast notifications
  - “Promise card” image export with generative pixel art
- **Pixel Art Generator**
  - 12×12 mirrored grid, rare blue accents
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
npm install
# or
yarn install
```

### 3. Compile & deploy contracts

```bash
npx hardhat compile
npx hardhat node         # in one terminal
npx hardhat run scripts/deploy.js --network localhost
```

> **Note:**
>
> - Update `CONTRACT_ADDRESS` in `src/hooks/useEthereum.js` after deployment.
> - For testnets/mainnet, configure `.env` and `hardhat.config.js`.

### 4. Frontend setup

```bash
cd client
npm start
# or
yarn start
```

Visit [http://localhost:3000](http://localhost:3000).

## Environment Variables

At project root, create `.env`:

```ini
RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_deployer_private_key
```

Load these in `hardhat.config.js` via `dotenv`.

## Usage

### Toggling Contract “Open” State

- As **owner**, use the **Open/Closed** toggle in the navbar to call `setOpen(true|false)`.
- When **closed**, only the owner can broadcast signed messages.
- When **open**, anyone with a valid signature may call `storeSignedMessage`.

### Connecting your wallet

1. Click **Connect Wallet** in the navbar.
2. Approve the connection in MetaMask.

### Signing a message

1. Type your promise into the **Your Message** textarea.
2. Click **Sign**.
3. A toast confirms the off-chain signature.

### Broadcasting on-chain

1. Once signed, click **Broadcast**.
2. Toast notifies pending/confirmation.
3. Confirmed messages appear in **Past Messages**.

### Exporting Promise Cards

1. In **Past Messages**, click the share icon.
2. Fullscreen modal opens with your message card.
3. Click **Download Image** (or **Show Icon** and then **Download Icon**).

## Folder Structure

```
eth-sign-now/
├─ contracts/            # Solidity & Hardhat
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
│  │  └─ utils/         # hashArt, identicon, etc.
│  ├─ .env
│  └─ package.json
├─ .gitignore
└─ README.md
```

## Customization

- **Contract Logic**: `contracts/Signatures.sol` (toggle behavior)
- **Pixel Art**: `client/src/utils/hashArt.js` (grid, rarity)
- **Styling**: `client/src/styles` or Tailwind config
- **Notifications**: Adjust `react-toastify` in `App.jsx`

## Troubleshooting

- **Network errors**: Verify `RPC_URL` & network config.
- **MetaMask issues**: Ensure correct chain and HTTP(S) origin.
- **Missing artifacts**: Run `npx hardhat compile`.

## License

This project is licensed under the MIT License.
See the [LICENSE](./LICENSE) file for details.
