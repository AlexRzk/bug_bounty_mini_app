import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import { bountyManagerAbi } from '../lib/contract-config.js'

const RPC = process.env.RPC_URL || 'https://sepolia.base.org'
const CONTRACT = process.env.CONTRACT_ADDRESS || '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf'
const NEW_COLLECTOR = process.env.NEW_COLLECTOR // 0x...
const PRIVATE_KEY = process.env.PRIVATE_KEY // 0x...

if (!NEW_COLLECTOR || !PRIVATE_KEY) {
  console.error('Usage: NEW_COLLECTOR=0x... PRIVATE_KEY=0x... node scripts/set-fee-collector.mjs')
  process.exit(1)
}

const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) })
const account = privateKeyToAccount(PRIVATE_KEY)
const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) })

async function main(){
  console.log('Setting fee collector to', NEW_COLLECTOR)
  const tx = await walletClient.writeContract({
    address: CONTRACT,
    abi: bountyManagerAbi,
    functionName: 'setFeeCollector',
    args: [NEW_COLLECTOR],
  })
  console.log('Sent tx:', tx)
}

main().catch(err=>{ console.error(err); process.exit(1) })
