import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const FEE_COLLECTOR = '0x38D28723190191042c06F4bc3A306dcbd38F2CDC';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

async function checkFeeCollector() {
  console.log('\n🔍 Fee Collector Address Analysis\n');
  console.log('Address:', FEE_COLLECTOR);
  
  try {
    // Get code at address (will be 0x if EOA, otherwise contract)
    const code = await client.getBytecode({ address: FEE_COLLECTOR });
    
    if (code === '0x') {
      console.log('✅ Type: EOA (Externally Owned Account)');
      console.log('   Can receive ETH directly: YES ✓');
    } else {
      console.log('⚠️  Type: SMART CONTRACT');
      console.log('   Can receive ETH: UNKNOWN (depends on receive/fallback)');
      console.log('   Code length:', code.length, 'bytes');
    }
    
    // Get balance
    const balance = await client.getBalance({ address: FEE_COLLECTOR });
    console.log('\n💰 Current Balance:', balance.toString(), 'wei (', (Number(balance) / 1e18).toFixed(6), 'ETH)');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFeeCollector();
