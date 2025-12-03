# Hook Bazaar Client

A React + Vite application for the Hook Bazaar protocol marketplace, built with RainbowKit, Wagmi, and TypeScript.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A WalletConnect Project ID (optional for MetaMask-only usage)
- Alchemy API key (optional, for enhanced RPC endpoints)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```bash
   # Required for WalletConnect (optional for MetaMask)
   VITE_WALLETCONNECT_PROJECT_ID=your-project-id-here
   
   # Optional: Enhanced RPC endpoints
   VITE_ALCHEMY_API_KEY=your-alchemy-api-key-here
   
   # Optional: For localhost testing
   VITE_PROTOCOL_ADMIN_CLIENT_LOCALHOST=0xYourDeployedAddressHere
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### Available Routes

- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/ProtocolDashboard` - Protocol Designer Dashboard
- `/ProtocolDashboard/createProtocol` - Create Protocol page
- `/hook-developer` - Hook Developer Dashboard
- `/integrator` - Integrator Portal

### Building for Production

```bash
npm run build
```

The production build will be in the `build/` directory.

### Environment Variables

All sensitive values (Project ID, Alchemy API key, Private Key) are stored in `.env` which is git-ignored. Never commit `.env` files to version control.

See `.env.example` for all available environment variables.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Viem** - Ethereum library
- **React Router** - Client-side routing

## Development

- **Dev server:** `npm run dev` - Starts Vite dev server on port 3000
- **Build:** `npm run build` - Generates production build
- **Deployments:** `npm run deployments` - Generates deployment data from contract broadcasts

## Project Structure

```
src/
├── components/     # React components
├── config/        # Configuration files (chains, contracts)
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
├── providers/     # Context providers (WalletProvider)
└── types/         # TypeScript type definitions
```

---

Original design: https://www.figma.com/design/qs0yKiZ24mceeMuX3wsKAo/Design-System-Implementation
