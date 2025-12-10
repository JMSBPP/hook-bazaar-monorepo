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
- [Hook Bazaar Monorepo](#Hook Bazaar Monorepo)
  - [Table of Contents](#table-of-contents)
  - [Demo](#demo)
  - [Problem Description](#problem-description)
  - [Solution Overview](#solution-overview)
  - [Arquitecture](#arquitecture)
  - [Setup](#setup)
    - [Build](#build)
    - [Test](#test)
    - [Deploy](#deploy)
  - [References](#references)


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


