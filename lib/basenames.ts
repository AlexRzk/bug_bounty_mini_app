import {
  Address,
  createPublicClient,
  encodePacked,
  http,
  keccak256,
  namehash,
} from 'viem'
import { base, baseSepolia } from 'viem/chains'
import L2ResolverAbi from '@/abis/L2ResolverAbi'

// Basenames only work on mainnet
const IS_TESTNET = process.env.NEXT_PUBLIC_USE_TESTNET === "true"
const BASENAME_CHAIN = IS_TESTNET ? baseSepolia : base

const BASENAME_L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD' as Address

const baseClient = createPublicClient({
  chain: BASENAME_CHAIN,
  transport: http(IS_TESTNET ? 'https://sepolia.base.org' : 'https://base.llamarpc.com', {
    batch: false,
    retryCount: 2,
    retryDelay: 500,
  }),
})

export type BaseName = `${string}.base.eth`

export enum BasenameTextRecordKeys {
  Description = 'description',
  Keywords = 'keywords',
  Url = 'url',
  Email = 'email',
  Phone = 'phone',
  Github = 'com.github',
  Twitter = 'com.twitter',
  Farcaster = 'xyz.farcaster',
  Lens = 'xyz.lens',
  Telegram = 'org.telegram',
  Discord = 'com.discord',
  Avatar = 'avatar',
}

/**
 * Convert an address to its reverse node for ENS lookup
 * Based on: https://github.com/coinbase/onchainkit/blob/main/src/identity/utils/convertReverseNodeToBytes.ts
 */
export function convertReverseNodeToBytes(address: Address, chainId: number): `0x${string}` {
  const addressFormatted = address.toLocaleLowerCase() as Address
  const addressNode = keccak256(addressFormatted.substring(2) as Address)
  const chainCoinType = convertChainIdToCoinType(chainId)
  const baseReverseNode = namehash(`${chainCoinType}.reverse`)
  const addressReverseNode = keccak256(encodePacked(['bytes32', 'bytes32'], [baseReverseNode, addressNode]))
  return addressReverseNode
}

/**
 * Convert chain ID to coin type for reverse resolution
 */
export function convertChainIdToCoinType(chainId: number): string {
  // For Base mainnet (chainId 8453), the coin type is -2147483648 + chainId
  // This follows EIP-2304 standard
  const cointype = (0x80000000 | chainId) >>> 0
  return cointype.toString(16)
}

/**
 * Resolve a Basename from an address
 */
export async function getBasename(address: Address): Promise<BaseName | undefined> {
  // Basenames only exist on mainnet, not testnet
  if (IS_TESTNET) {
    return undefined
  }
  
  try {
    const addressReverseNode = convertReverseNodeToBytes(address, BASENAME_CHAIN.id)
    const basename = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'name',
      args: [addressReverseNode],
    })
    
    if (basename && basename.endsWith('.base.eth')) {
      return basename as BaseName
    }
    
    return undefined
  } catch (error) {
    console.error('Error resolving Basename:', error)
    return undefined
  }
}

/**
 * Get the avatar for a Basename
 */
export async function getBasenameAvatar(basename: BaseName): Promise<string | undefined> {
  try {
    const node = namehash(basename)
    const avatar = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'text',
      args: [node, BasenameTextRecordKeys.Avatar],
    })
    
    return avatar || undefined
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return undefined
  }
}

/**
 * Get a text record for a Basename
 */
export async function getBasenameTextRecord(
  basename: BaseName,
  key: BasenameTextRecordKeys
): Promise<string | undefined> {
  try {
    const node = namehash(basename)
    const record = await baseClient.readContract({
      abi: L2ResolverAbi,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'text',
      args: [node, key],
    })
    
    return record || undefined
  } catch (error) {
    console.error(`Error fetching text record ${key}:`, error)
    return undefined
  }
}
