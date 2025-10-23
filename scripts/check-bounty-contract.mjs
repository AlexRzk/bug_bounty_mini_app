import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http()
})

const CONTRACT_ADDRESS = '0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a'

const ABI = [
  {
    inputs: [],
    name: "nextBountyId",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_bountyId", type: "uint256" }],
    name: "getBounty",
    outputs: [
      { name: "creator", type: "address" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "reward", type: "uint256" },
      { name: "paymentType", type: "uint8" },
      { name: "tokenAddress", type: "address" },
      { name: "status", type: "uint8" },
      { name: "winner", type: "address" },
      { name: "deadline", type: "uint256" },
      { name: "farcasterCastHash", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  }
]

async function checkContract() {
  try {
    console.log('Checking contract at:', CONTRACT_ADDRESS)
    console.log('Chain: Base Mainnet (ID: 8453)\n')

    // Get next bounty ID
    const nextBountyId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'nextBountyId'
    })

    console.log('Next Bounty ID:', nextBountyId.toString())
    const totalBounties = Number(nextBountyId) - 1
    console.log('Total Bounties Created:', totalBounties)

    if (totalBounties === 0) {
      console.log('\n❌ No bounties found on this contract!')
      console.log('This means either:')
      console.log('1. The contract address is wrong')
      console.log('2. The bounty creation transaction failed')
      console.log('3. You deployed a new contract without bounties')
      return
    }

    console.log('\n📋 Fetching all bounties...\n')

    // Fetch all bounties
    for (let i = 1; i <= totalBounties; i++) {
      try {
        const bounty = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'getBounty',
          args: [BigInt(i)]
        })

        const [creator, title, description, reward, paymentType, tokenAddress, status, winner, deadline, castHash] = bounty

        console.log(`Bounty #${i}:`)
        console.log(`  Title: ${title}`)
        console.log(`  Description: ${description}`)
        console.log(`  Reward: ${reward.toString()} wei`)
        console.log(`  Status: ${status} (0=Open, 1=Completed, 2=Cancelled)`)
        console.log(`  Creator: ${creator}`)
        console.log(`  Deadline: ${new Date(Number(deadline) * 1000).toLocaleString()}`)
        console.log()
      } catch (err) {
        console.log(`Bounty #${i}: Error fetching -`, err.message)
      }
    }
  } catch (error) {
    console.error('Error:', error.message)
    console.error('\nFull error:', error)
  }
}

checkContract()
