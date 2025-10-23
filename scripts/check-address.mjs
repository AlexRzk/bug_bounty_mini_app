import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http()
})

const ADDRESS = '0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a'

async function checkAddress() {
  try {
    console.log('Checking if address has contract code...')
    console.log('Address:', ADDRESS)
    console.log('Chain: Base Mainnet\n')

    const code = await client.getBytecode({ address: ADDRESS })
    
    if (!code || code === '0x') {
      console.log('❌ NO CONTRACT CODE FOUND!')
      console.log('\nThis address is either:')
      console.log('  1. An EOA (externally owned account) - a wallet')
      console.log('  2. A contract on a DIFFERENT network (like Base Sepolia)')
      console.log('  3. Never deployed\n')
      
      console.log('🔍 Please verify:')
      console.log('  - Check Basescan: https://basescan.org/address/' + ADDRESS)
      console.log('  - Check Base Sepolia: https://sepolia.basescan.org/address/' + ADDRESS)
      console.log('  - Check your deployment transactions')
    } else {
      console.log('✅ Contract code found!')
      console.log('Code length:', code.length, 'bytes')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkAddress()
