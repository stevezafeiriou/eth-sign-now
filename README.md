# Elliptic Promise

![Elliptic Promise Dashboard](/screenshots/PromiseView.png)

A full‑stack Ethereum “message signing & broadcasting” dApp built with Hardhat, Ethers.js, and React.

Users can sign arbitrary messages off‑chain, then (if permitted) broadcast them on‑chain—and everyone can up/down‑vote each message weighted by on‑chain ETH balance. Each signed message also generates a unique on‑chain “promise card” pixel art that you can download as an image.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repo](#1-clone-the-repo)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Compile & Deploy](#3-compile--deploy)
  - [4. Frontend](#4-frontend)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Toggle “Open” State](#toggle-open-state)
  - [Connect Wallet](#connect-wallet)
  - [Sign & Broadcast Messages](#sign--broadcast-messages)
  - [Vote on Messages](#vote-on-messages)
  - [View & Download Promise Cards](#view--download-promise-cards)
- [Contract Reference](#contract-reference)
- [Folder Structure](#folder-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

### Smart Contract (`Signatures.sol`)

- **Toggleable**: Owner can call `setOpen(bool)` to allow/disallow anyone broadcasting.
- **Message Signing**: Off‑chain 𝑒𝑡ℎ_sign, on‑chain `storeSignedMessage(message, signature)` (verifies ECDSA).
- **ETH‑Weighted Voting**: Anyone (with nonzero ETH balance) can call `vote(messageId, support)` once per message.
- **Data Accessors**:
  - `forVotes(msgId)` & `againstVotes(msgId)`
  - `totalVotes(msgId)`
  - `recoverSigner(message, signature)` & `verify(message, signature, expectedSigner)`

### React Frontend

- **Connection Management**: MetaMask/EIP‑1193 connect & disconnect.
- **Owner UI**: Displays “Open”/“Closed” state and toggle button (only for owner).
- **Message Browser**:
  - Table of past messages with search, sort (by id, for‑votes, against‑votes), and live vote totals.
  - Clicking a row navigates to **Promise Detail**.
- **Promise Detail**:
  - Renders on‑chain pixel art (deterministic from signature).
  - Shows for/against bars, vote counts, history of votes.
  - “↑ For” and “↓ Against” vote buttons with toast notifications.
  - “Download Image” button beside “← Go Back” to save the canvas art.
- **Pixel Art Generator**:
  - 12×12 mirrored grid with rare-color accents, seeded by the signature hash.
- **Responsive, Themed**:
  - Styled‑components global styles, light/dark theme, frosted‑glass UI components.

## Prerequisites

- **Node.js** v18+ (v20 recommended)
- **npm** v9+ or **yarn** v1.22+
- **Hardhat** for local Ethereum
- **MetaMask** or other EIP‑1193 wallet

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/eth-sign-now.git
cd eth-sign-now
```

### 2. Install dependencies

```bash
npm install
```

_or_

```bash
yarn install
```

### 3. Compile & Deploy

In one terminal, start a local node:

```bash
npx hardhat node
```

In another, compile & deploy:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

> **Tip:** After deploy, copy the deployed address into
> `src/hooks/useEthereum.js` → `CONTRACT_ADDRESS`.

### 4. Frontend

```bash
cd client
npm start
```

_open_ [http://localhost:3000](http://localhost:3000)

## Environment Variables

At project root, create a `.env`:

```ini
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=<your_deployer_key>
```

Load these in `hardhat.config.js` with `dotenv`.

## Usage

### Toggle “Open” State

- **Owner** sees an **Enable/Disable** button in the sidebar.
- When **closed**, only owner can broadcast. When **open**, anyone with a valid ECDSA signature may call `storeSignedMessage`.

### Connect Wallet

- Click **Connect** in the sidebar and approve in MetaMask.
- Your address appears, and owner‑only controls unlock if you’re the contract owner.

### Sign & Broadcast Messages

1. In **Create Promise**, type your text.
2. Click **Sign** to produce an off‑chain signature.
3. Click **Broadcast** to call `storeSignedMessage(message, signature)`.
4. Toast notifications show pending/confirmed.

### Vote on Messages

- In **Dashboard**, use the **For**/ **Against** buttons under each promise detail.
- Votes are weighted by your ETH balance at the time of voting.
- Each address may vote only once per message.

### View & Download Promise Cards

1. Click a row in **Past Messages** to open **Promise Detail**.
2. The left panel shows the generated pixel art canvas.
3. Click **Download Image** (next to “← Go Back”) to save the art as PNG.

## Folder Structure

```
eth-sign-now/
├─ contracts/
│  ├─ Signatures.sol
│  ├─ scripts/deploy.js
│  ├─ test/
│  └─ hardhat.config.js
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/    # EventsTable, PromiseDetail, Sidebar…
│  │  ├─ hooks/         # useEthereum.js
│  │  ├─ styles/        # GlobalStyles, glass…
│  │  └─ utils/         # hashArt, etc.
│  └─ package.json
├─ .env
├─ README.md
└─ LICENSE
```

## Troubleshooting

- **Contract calls revert**: verify `CONTRACT_ADDRESS` and ABI match your deployed instance.
- **Cannot read owner/open**: ensure your chain is up (`npx hardhat node`) and the contract code at that address is non‑zero.
- **Wallet errors**: check MetaMask is on the same chain (localhost:8545).
- **Canvas download not working**: make sure the “Download Image” button calls `canvas.toDataURL()` under the hood.

## License

This project is licensed under MIT. See [LICENSE](LICENSE) for details.
