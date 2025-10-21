/**
 * Bounty Parser - Extract bounty details from Farcaster cast text
 * Supports hashtag-based and natural language parsing
 */

export interface ParsedBounty {
  title: string
  description: string
  reward: string // In ETH
  severity: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  isValid: boolean
  errors: string[]
}

/**
 * Parse bounty details from cast text
 * 
 * Supported formats:
 * 1. Hashtag-based:
 *    "Create bounty: Fix login bug #reward:0.1 #severity:high #category:frontend"
 * 
 * 2. Natural language:
 *    "Need someone to fix the authentication bug, willing to pay 0.1 ETH"
 */
export function parseBountyFromCast(castText: string): ParsedBounty {
  const result: ParsedBounty = {
    title: '',
    description: '',
    reward: '0',
    severity: 'medium',
    isValid: false,
    errors: [],
  }

  // Remove mentions and clean text
  const cleanText = castText
    .replace(/@[\w]+/g, '') // Remove mentions
    .trim()

  // Extract hashtags
  const hashtags = extractHashtags(cleanText)
  
  // Extract reward
  const rewardMatch = hashtags.reward || cleanText.match(/(\d+\.?\d*)\s*(ETH|eth)/i)
  if (rewardMatch) {
    result.reward = typeof rewardMatch === 'string' 
      ? rewardMatch 
      : rewardMatch[1]
  } else {
    result.errors.push('No reward amount specified. Use #reward:0.1 or mention "0.1 ETH"')
  }

  // Extract severity
  const severityMatch = hashtags.severity || extractSeverityFromText(cleanText)
  if (severityMatch) {
    const severity = severityMatch.toLowerCase()
    if (['low', 'medium', 'high', 'critical'].includes(severity)) {
      result.severity = severity as ParsedBounty['severity']
    }
  }

  // Extract category
  if (hashtags.category) {
    result.category = hashtags.category
  }

  // Extract title and description
  const textWithoutHashtags = cleanText.replace(/#\w+:[^\s]+/g, '').trim()
  
  // Look for "Create bounty:" or similar patterns
  const titleMatch = textWithoutHashtags.match(/(?:create bounty:|bounty:)\s*([^.!?]+)/i)
  if (titleMatch) {
    result.title = titleMatch[1].trim()
    result.description = textWithoutHashtags.replace(titleMatch[0], '').trim() || result.title
  } else {
    // Use first sentence as title, rest as description
    const sentences = textWithoutHashtags.split(/[.!?]+/)
    result.title = sentences[0]?.trim() || 'Bounty from Farcaster'
    result.description = sentences.slice(1).join('. ').trim() || result.title
  }

  // Validate
  if (!result.title) {
    result.errors.push('No title found. Start with "Create bounty: [title]" or describe the issue.')
  }
  
  if (result.title.length > 200) {
    result.errors.push('Title too long (max 200 characters)')
  }

  if (parseFloat(result.reward) <= 0) {
    result.errors.push('Reward must be greater than 0')
  }

  result.isValid = result.errors.length === 0

  return result
}

/**
 * Extract hashtags from text
 */
function extractHashtags(text: string): Record<string, string> {
  const hashtags: Record<string, string> = {}
  const matches = text.matchAll(/#(\w+):([^\s]+)/g)
  
  for (const match of matches) {
    const key = match[1].toLowerCase()
    const value = match[2]
    hashtags[key] = value
  }
  
  return hashtags
}

/**
 * Extract severity from natural language
 */
function extractSeverityFromText(text: string): string | null {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('critical') || lowerText.includes('urgent')) {
    return 'critical'
  }
  if (lowerText.includes('high') || lowerText.includes('important')) {
    return 'high'
  }
  if (lowerText.includes('low') || lowerText.includes('minor')) {
    return 'low'
  }
  if (lowerText.includes('medium') || lowerText.includes('moderate')) {
    return 'medium'
  }
  
  return null
}

/**
 * Format bounty for display in confirmation cast
 */
export function formatBountyConfirmation(bounty: ParsedBounty, txHash?: string): string {
  const lines = [
    '✅ Bounty Created!',
    '',
    `📋 ${bounty.title}`,
    `💰 Reward: ${bounty.reward} ETH`,
    `🔥 Severity: ${bounty.severity.toUpperCase()}`,
  ]

  if (bounty.category) {
    lines.push(`📁 Category: ${bounty.category}`)
  }

  if (txHash) {
    lines.push('')
    lines.push(`🔗 View on BaseScan:`)
    lines.push(`https://basescan.org/tx/${txHash}`)
  }

  return lines.join('\n')
}

/**
 * Format error message for failed bounty creation
 */
export function formatBountyError(errors: string[]): string {
  const lines = [
    '❌ Could not create bounty',
    '',
    'Issues:',
    ...errors.map(e => `• ${e}`),
    '',
    'Format: Create bounty: [title] #reward:0.1 #severity:high',
  ]

  return lines.join('\n')
}
