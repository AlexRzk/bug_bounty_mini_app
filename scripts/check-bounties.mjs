#!/usr/bin/env node

import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import fs from 'fs';

const CONTRACT_ADDRESS = '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf';

const abiPath = './lib/bounty-manager-abi.json';
const abiContent = fs.readFileSync(abiPath, 'utf-8');
const bountyManagerAbi = JSON.parse(abiContent);

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

async function checkBountyDetails() {
  console.log('\n📋 Bounty Details\n');

  try {
    const nextBountyId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'nextBountyId',
    });

    const bountyCount = Number(nextBountyId);
    console.log('Total bounties (next ID):', bountyCount);
    console.log('Actual bounties created:', bountyCount - 1, '\n');

    // Check each bounty
    for (let i = 1; i < bountyCount; i++) {
      try {
        const bounty = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: bountyManagerAbi,
          functionName: 'getBounty',
          args: [BigInt(i)],
        });

        const [creator, title, desc, reward, paymentType, tokenAddr, status, winner, createdAt, deadline, farcasterHash] = bounty;

        console.log(`Bounty #${i}:`);
        console.log(`  Title: ${title}`);
        console.log(`  Status: ${status === 0n ? '🟢 OPEN' : status === 1n ? '🟡 COMPLETED' : '🔴 CANCELLED'}`);
        console.log(`  Reward: ${formatEther(reward)} ETH`);
        console.log(`  Winner: ${winner === '0x0000000000000000000000000000000000000000' ? 'None (not completed)' : winner}`);
        console.log(`  Creator: ${creator}\n`);

      } catch (err) {
        console.log(`Bounty #${i}: Error reading -`, err.message);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBountyDetails();
