#!/usr/bin/env node

import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';
import readline from 'readline';

const CONTRACT_ADDRESS = '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf';
const NEW_FEE_COLLECTOR = '0x2C88F1279dff31ce285c3e270E5d59AF203115e0';

// Read the ABI
const abiPath = './lib/bounty-manager-abi.json';
const abiContent = fs.readFileSync(abiPath, 'utf-8');
const bountyManagerAbi = JSON.parse(abiContent);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

async function updateFeeCollector() {
  console.log('\n🔧 Update Fee Collector Address\n');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('New Fee Collector:', NEW_FEE_COLLECTOR);
  console.log('Network: Base Sepolia (84532)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  try {
    // Get current fee collector
    const currentCollector = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'feeCollector',
    });

    console.log('📋 Current Fee Collector:', currentCollector);
    console.log('📋 New Fee Collector:', NEW_FEE_COLLECTOR);
    console.log('\n⚠️  IMPORTANT:');
    console.log('  1. You MUST be the contract OWNER to run this');
    console.log('  2. Have your PRIVATE KEY ready');
    console.log('  3. This will cost gas fees\n');

    const proceed = await question('Continue? (yes/no): ');
    
    if (proceed.toLowerCase() !== 'yes') {
      console.log('Cancelled.');
      rl.close();
      return;
    }

    const privateKeyInput = await question('\n🔑 Enter your PRIVATE KEY (from owner wallet):\n>>> 0x');
    const privateKey = '0x' + privateKeyInput;

    // Validate private key format
    if (privateKey.length !== 66) {
      console.log('❌ Invalid private key length');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating wallet client...');
    const walletClient = createWalletClient({
      account: privateKeyInput.startsWith('0x') 
        ? { privateKey: privateKeyInput, address: await publicClient.getAddresses?.() }
        : { privateKey: '0x' + privateKeyInput, address: await publicClient.getAddresses?.() },
      chain: baseSepolia,
      transport: http()
    });

    console.log('⏳ Preparing transaction...');
    
    // Build the transaction
    const hash = await walletClient.writeContract({
      account: walletClient.account,
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'setFeeCollector',
      args: [NEW_FEE_COLLECTOR],
    });

    console.log('\n✅ Transaction sent!');
    console.log('📍 Hash:', hash);
    console.log('\n⏳ Waiting for confirmation...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log('\n✅ SUCCESS! Fee collector updated!');
      console.log('📍 Transaction:', `https://sepolia.basescan.org/tx/${hash}`);
      console.log('💰 New fee collector:', NEW_FEE_COLLECTOR);
    } else {
      console.log('\n❌ Transaction failed');
      console.log('Status:', receipt.status);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('  - Private key is correct');
    console.error('  - You are the contract owner');
    console.error('  - You have enough gas ETH');
  }

  rl.close();
}

updateFeeCollector();
