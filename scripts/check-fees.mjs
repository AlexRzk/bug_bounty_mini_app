// Quick fee check using viem (already in your project)
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { bountyManagerAbi } from '../lib/contract-config.js';

const CONTRACT_ADDRESS = '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

async function checkFees() {
  console.log('🔍 Checking BountyManager Fee Configuration\n');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('Network: Base Sepolia\n');

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
    
    if (feePercent === 0n) {
      console.log('\n⚠️  WARNING: Platform fee is 0! No fees will be collected.');
      console.log('   To fix: setPlatformFee(250) as owner for 2.5% fee');
    }

    // Check fee collector balance
    const balance = await client.getBalance({ address: feeCollector });
    console.log('\n💰 Fee Collector Balance:');
    console.log('  ETH:', formatEther(balance));

    // Check next bounty ID
    const nextBountyId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: bountyManagerAbi,
      functionName: 'nextBountyId',
    });
    console.log('\n📊 Total Bounties Created:', (Number(nextBountyId) - 1).toString());

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

checkFees();
