/**
 * Test script for bounty parser
 * Run: node --loader ts-node/esm scripts/test-parser.mjs
 */

import { parseBountyFromCast, formatBountyConfirmation, formatBountyError } from '../lib/bounty-parser'

console.log('🧪 Testing Bounty Parser\n')

const testCases = [
  {
    name: 'Hashtag format',
    cast: '@BountyBot Create bounty: Fix login redirect bug #reward:0.1 #severity:high #category:frontend\n\nThe user gets redirected to wrong page after login',
  },
  {
    name: 'Natural language',
    cast: '@BountyBot Need someone to fix authentication bug, willing to pay 0.15 ETH. This is a critical issue.',
  },
  {
    name: 'Mixed format',
    cast: 'Create bounty: Database query optimization #reward:0.2\n\nQueries are taking 5+ seconds on production. Need urgent help!',
  },
  {
    name: 'Invalid - no reward',
    cast: '@BountyBot Please help fix my bug, it\'s really important!',
  },
  {
    name: 'Minimal valid',
    cast: 'Fix the API endpoint bug #reward:0.05',
  },
]

testCases.forEach((test, i) => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Test ${i + 1}: ${test.name}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`📝 Cast: ${test.cast}`)
  console.log()

  const result = parseBountyFromCast(test.cast)
  
  console.log(`✅ Valid: ${result.isValid}`)
  console.log(`📋 Title: ${result.title}`)
  console.log(`📄 Description: ${result.description}`)
  console.log(`💰 Reward: ${result.reward} ETH`)
  console.log(`🔥 Severity: ${result.severity}`)
  
  if (result.category) {
    console.log(`📁 Category: ${result.category}`)
  }
  
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors:`)
    result.errors.forEach(err => console.log(`   • ${err}`))
  }
  
  if (result.isValid) {
    console.log(`\n📨 Confirmation message:`)
    console.log(formatBountyConfirmation(result, '0x1234...5678'))
  } else {
    console.log(`\n📨 Error message:`)
    console.log(formatBountyError(result.errors))
  }
})

console.log(`\n${'='.repeat(60)}`)
console.log('✅ All tests completed!')
console.log(`${'='.repeat(60)}\n`)
