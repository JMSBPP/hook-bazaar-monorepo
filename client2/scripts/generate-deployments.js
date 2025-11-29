#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Chain ID to name mapping
const CHAIN_NAMES = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia',
  84532: 'Base Sepolia',
  421614: 'Arbitrum Sepolia',
  80001: 'Mumbai',
  31337: 'Anvil Localhost',
  1337: 'Hardhat Localhost',
  1301: 'Unichain Sepolia',
};

// Determine network type from chain ID
function getNetworkType(chainId) {
  if (chainId === 1) return 'mainnet';
  if (chainId === 31337 || chainId === 1337) return 'localhost';
  return 'testnet';
}

// Path to the contracts broadcast directory
const BROADCAST_DIR = path.resolve(__dirname, '../../contracts/protocol-pkg/broadcast/Deploy.s.sol');

function scanBroadcastDirectory() {
  const deployments = [];

  try {
    if (!fs.existsSync(BROADCAST_DIR)) {
      console.warn(`Broadcast directory not found: ${BROADCAST_DIR}`);
      return deployments;
    }

    // Read all chain ID directories
    const chainDirs = fs.readdirSync(BROADCAST_DIR);

    for (const chainDir of chainDirs) {
      const chainId = parseInt(chainDir);
      if (isNaN(chainId)) continue;

      const chainPath = path.join(BROADCAST_DIR, chainDir);
      const latestFile = path.join(chainPath, 'run-latest.json');

      if (fs.existsSync(latestFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));

          // Find ProtocolAdminClient deployment
          const protocolAdminTx = data.transactions?.find(
            (tx) => tx.contractName === 'ProtocolAdminClient' && tx.transactionType === 'CREATE'
          );

          if (protocolAdminTx && protocolAdminTx.contractAddress) {
            deployments.push({
              chainId,
              chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
              networkType: getNetworkType(chainId),
              protocolAdminClientAddress: protocolAdminTx.contractAddress,
            });
            console.log(`✓ Found deployment on ${CHAIN_NAMES[chainId] || chainId}: ${protocolAdminTx.contractAddress}`);
          }
        } catch (error) {
          console.error(`Error reading ${latestFile}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error scanning broadcast directory:', error.message);
  }

  return deployments;
}

// Main execution
const deployments = scanBroadcastDirectory();

// Write to src/lib/deployments/static-deployments.json
const outputPath = path.resolve(__dirname, '../src/lib/deployments/static-deployments.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(deployments, null, 2));

console.log(`\n✓ Generated deployments file: ${outputPath}`);
console.log(`  Found ${deployments.length} deployment(s)`);

if (deployments.length === 0) {
  console.log('\n⚠ No deployments found. Make sure contracts are deployed and broadcast files exist.');
}