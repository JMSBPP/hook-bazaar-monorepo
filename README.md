# Hook Bazaar Monorepo

<div align="center">

  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity-"/> 
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Foundry-000000?style=for-the-badge&logo=foundry&logoColor=white" alt="Foundry"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
</div>

<p align="center">
  <img src="client2/src/assets/d9960bdb814135603341883999ea9dc547d831b8.png" alt="Description" width="300"/>
</p>



## Table of Contents
- [Hook Bazaar Monorepo](#hook-bazaar-monorepo)
  - [Table of Contents](#table-of-contents)
  - [Problem Description](#problem-description)
  - [Solution Overview](#solution-overview)
  - [Architecture](#architecture)
  - [Setup](#setup)
  - [References](#references)

## Problem Description

Hook Bazaar solves **9 critical market failures** in the Uniswap v4 ecosystem:

1. **No marketplace for hooks** — Supply and demand exist but no mechanism connects them
2. **High barriers to entry** — Custom hooks cost $10k–$100k+ and take weeks/months to develop
3. **No developer incentives** — No monetization model or audience for hook developers
4. **Lack of standardization** — No way to objectively evaluate hook safety or correctness
5. **No hook composition** — Cannot safely combine multiple hooks despite v4 support
6. **No competition mechanism** — Best hooks don't naturally rise to the top
7. **No IP protection** — Public code prevents premium algorithm development
8. **No reputation system** — High adoption risk due to lack of trust signals
9. **Unsustainable economics** — No revenue model to support ecosystem growth

**Result**: Despite Uniswap v4's powerful hooks primitive, the ecosystem lacks the infrastructure to enable widespread adoption and sustainable development.

📖 **[Read the full Problem Description](docs/problem-description/PROBLEM_DESCRIPTION.md)** for detailed analysis of each market failure and how Hook Bazaar solves them.

## Solution Overview

Hook Bazaar is a **decentralized marketplace and infrastructure layer** for Uniswap v4 hooks that:

- **For Developers**: Direct monetization (flat/revenue-share/hybrid), professional reputation profiles, IP protection via FHE
- **For Protocols**: Instant deployment (minutes vs weeks), lower costs ($100s vs $10k+), pre-audited hooks, multi-hook composition
- **For Ecosystem**: Self-sustaining economic model, quality through competition, accelerated v4 adoption


# Setup

Minimal setup to run the frontend and indexer locally.

## Prerequisites

- Node.js v18+
- Foundry

## Quick Start


### 1. Install Dependencies

```bash
npm install
forge install
```

### 2. Frontend

Start the frontend development server:

```bash
npm run dev
```

Frontend runs on: **http://localhost:3000**

### 3. HookAttestationAVS Operator

The operator verifies hook implementations match their specifications without accessing source code.

```bash
cd operator
npm install
```

**Run tests:**
```bash
npm test
```

**Run operator in dry-run mode:**
```bash
cp .env.example .env
anvil  // on separate terminal
npm start
```

**Constraints:**
- Dry-run mode only (on-chain contracts not yet deployed)
- Uses mock state sampler (real IHookStateView pending)
- BLS signatures and multi-operator consensus pending EigenLayer integration

See `operator/INTEGRATION_ROADMAP.md` for full integration requirements.

### 4. Contracts
- `forge build` - Compile contracts
- `forge test` - Run tests


