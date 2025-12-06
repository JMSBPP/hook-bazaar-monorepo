# Indexer - Quick Start

Minimal setup to run the indexer locally.

## Prerequisites

- Node.js v18+
- Docker (for PostgreSQL)

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create `indexer/.env`:

```bash
RPC_UNI_TESTNET_HTTP=https://your-rpc-endpoint-here
```

### 3. Start Database

```bash
npm run indexer:db:up
```

### 4. Build Indexer

```bash
npm run indexer:build
```

### 5. Apply Migrations

```bash
npm run indexer:migration
```

### 6. Run Indexer

```bash
npm run indexer
```

The indexer will start indexing `ProtocolCreated` events and store them in PostgreSQL.

## Available Commands

- `npm run indexer:build` - Build TypeScript to JavaScript
- `npm run indexer` - Run the indexer processor
- `npm run indexer:db:up` - Start PostgreSQL (port 5432)
- `npm run indexer:db:down` - Stop PostgreSQL
- `npm run indexer:migration` - Apply database migrations
- `npm run indexer:graphql` - Start GraphQL server (port 4350)

## Troubleshooting

- **RPC error**: Check `RPC_UNI_TESTNET_HTTP` in `indexer/.env`
- **Database error**: Ensure PostgreSQL is running (`npm run indexer:db:up`)
- **Build error**: Run `npm install` at root directory
