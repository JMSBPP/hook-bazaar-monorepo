# Hook Bazaar Monorepo

Minimal setup to run the frontend and indexer locally.

## Prerequisites

- Node.js v18+
- Docker (for indexer PostgreSQL)

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

### 3. Indexer

#### Setup (first time only)

1. Set RPC endpoint in root `.env`:
   ```bash
   RPC_UNI_TESTNET_HTTP=https://your-rpc-endpoint-here
   ```
   (The indexer reads from the root `.env` file)

2. Start PostgreSQL:
   ```bash
   npm run indexer:db:up
   ```

3. Build and migrate:
   ```bash
   npm run indexer:build
   npm run indexer:migration
   ```

#### Run Indexer

```bash
npm run indexer
```

Indexer runs on: **PostgreSQL port 5432**

(Optional) GraphQL server on port 4350:
```bash
npm run indexer:graphql
```
**Note:** Requires `@subsquid/openreader` package (install with `npm install`)

## Available Commands

### Frontend
- `npm run dev` - Start Vite dev server (port 3000)
- `npm run build` - Build for production

### Indexer
- `npm run indexer:build` - Build TypeScript
- `npm run indexer` - Run indexer processor
- `npm run indexer:graphql` - Start GraphQL server (port 4350)

### Contracts
- `forge build` - Compile contracts
- `forge test` - Run tests

