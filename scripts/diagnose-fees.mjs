#!/usr/bin/env node

import { createPublicClient, http, formatEther, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';

const CONTRACT_ADDRESS = '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf';

// Read the ABI from the JSON file
const abiPath = './lib/bounty-manager-abi.json';
const abiContent = fs.readFileSync(abiPath, 'utf-8');
const bountyManagerAbi = JSON.parse(abiContent);

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

async function diagnoseFees() {
  console.log('\n🔍 BountyManager Fee Diagnosis\n');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('Network: Base Sepolia (84532)\n');

  try {
    // Check fee percent
    const feePercent = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'platformFeePercent',
    });

    // Check fee collector
    const feeCollector = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'feeCollector',
    });

    // Check owner
    const owner = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'owner',
    });

    console.log('📋 Contract Configuration:');
    console.log('  Owner:', owner);
    console.log('  Fee Collector:', feeCollector);
    console.log('  Platform Fee:', feePercent.toString(), 'bps =', (Number(feePercent) / 100).toFixed(2) + '%');
    
    // Check if feeCollector is zero address
    if (feeCollector === '0x0000000000000000000000000000000000000000') {
      console.log('\n⚠️  CRITICAL: Fee collector is 0x0! Fees are being sent nowhere!');
      console.log('   To fix: Call setFeeCollector(YOUR_ADDRESS) as the owner');
    } else if (feeCollector.toLowerCase() === owner.toLowerCase()) {
      console.log('\n⚠️  WARNING: Fee collector is the same as owner. This is unusual.');
    }

    // Check fee collector balance
    const balance = await client.getBalance({ address: feeCollector });
    console.log('\n💰 Fee Collector Balance:');
    console.log('  ETH:', formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      console.log('  ⚠️  Balance is 0. Either no fees have been collected, or there\'s a bug.');
    }

    // Check next bounty ID
    const nextBountyId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'nextBountyId',
    });
    
    const bountyCount = Number(nextBountyId) - 1;
    console.log('\n📊 Bounty Statistics:');
    console.log('  Total Bounties Created:', bountyCount);
    
    if (bountyCount > 0 && balance === 0n) {
      console.log('\n  ❌ PROBLEM: Bounties were created but no fees collected!');
      console.log('\n  Possible causes:');
      console.log('     1. Fee collector address is wrong/invalid');
      console.log('     2. No bounties were COMPLETED (only created)');
      console.log('     3. Platform fee is set to 0%');
      console.log('     4. Bounties were created with 0 reward');
    }

  } catch (error) {
    console.error('\n❌ Error reading contract:', error.message);
    console.error('\nMake sure:');
    console.error('  - Contract address is correct:', CONTRACT_ADDRESS);
    console.error('  - You have internet connection');
    console.error('  - Base Sepolia RPC is accessible');
  }
}

diagnoseFees();
