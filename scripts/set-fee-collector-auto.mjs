#!/usr/bin/env node

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';

const CONTRACT_ADDRESS = '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf';
const NEW_FEE_COLLECTOR = '0x2C88F1279dff31ce285c3e270E5d59AF203115e0';

// Read private key from contracts/.env
const envFile = fs.readFileSync('./contracts/.env', 'utf-8');
const privateKeyMatch = envFile.match(/PRIVATE_KEY=(.+)/);
const PRIVATE_KEY = privateKeyMatch ? privateKeyMatch[1].trim() : null;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY not found in contracts/.env');
  process.exit(1);
}

// Read the ABI
const abiPath = './lib/bounty-manager-abi.json';
const abiContent = fs.readFileSync(abiPath, 'utf-8');
const bountyManagerAbi = JSON.parse(abiContent);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

async function updateFeeCollector() {
  console.log('\n🔧 Update Fee Collector Address\n');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('Old Fee Collector:', '0x38D28723190191042c06F4bc3A306dcbd38F2CDC');
  console.log('New Fee Collector:', NEW_FEE_COLLECTOR);
  console.log('Network: Base Sepolia (84532)\n');

  try {
    // Get account from private key
    const account = privateKeyToAccount(PRIVATE_KEY);
    console.log('📋 Owner Account:', account.address);

    // Get current fee collector
    const currentCollector = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'feeCollector',
    });

    console.log('📋 Current Fee Collector:', currentCollector);
    console.log('📋 New Fee Collector:', NEW_FEE_COLLECTOR);

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http('https://sepolia.base.org')
    });

    console.log('\n⏳ Preparing transaction...');
    
    // Send the transaction
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'setFeeCollector',
      args: [NEW_FEE_COLLECTOR],
    });

    console.log('✅ Transaction sent!');
    console.log('📍 Hash:', hash);
    console.log('\n⏳ Waiting for confirmation (this may take 10-30 seconds)...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
    
    if (receipt.status === 'success') {
      console.log('\n✅✅✅ SUCCESS! Fee collector updated!\n');
      console.log('📍 Transaction:', `https://sepolia.basescan.org/tx/${hash}`);
      console.log('💰 Old Fee Collector:', currentCollector);
      console.log('💰 New Fee Collector:', NEW_FEE_COLLECTOR);
      console.log('\n🎉 Fees will now be sent to your MetaMask wallet!');
    } else {
      console.log('\n❌ Transaction failed');
      console.log('Status:', receipt.status);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('insufficient balance')) {
      console.error('\n⚠️  You need more gas ETH on Base Sepolia');
      console.error('Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
    }
  }
}

updateFeeCollector();
