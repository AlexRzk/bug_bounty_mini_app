import { Address, getAddress, createPublicClient, http } from "viem"
import { base } from "viem/chains"

// Universal Resolver on Base mainnet (ENS-compatible)
export const BASENAME_UNIVERSAL_RESOLVER =
  "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as Address

// Simple in-memory cache to avoid repeated RPC calls
const nameCache = new Map<string, string | null>()

// Accept common Base name TLDs
const VALID_TLDS = [".base.eth", ".cb.id"]

/**
 * Resolve a Basename for an address on Base mainnet.
 * Uses Base's native RPC for proper resolution.
 */
export async function resolveBasename(
  client: any,
  address: Address
): Promise<string | null> {
  try {
    const checksum = getAddress(address)
    const key = checksum.toLowerCase()
    if (nameCache.has(key)) return nameCache.get(key) ?? null

    // Create a dedicated Base mainnet client for ENS lookups
    const baseClient = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org')
    })

    // Reverse lookup using Base's native provider
    let reverseName: string | null = null
    try {
      reverseName = await baseClient.getEnsName({
        address: checksum,
        universalResolverAddress: BASENAME_UNIVERSAL_RESOLVER,
      })
    } catch (reverseErr: any) {
      // If contract reverts (no reverse record), that's expected - just return null
      if (reverseErr?.message?.includes('reverted') || reverseErr?.message?.includes('revert')) {
        nameCache.set(key, null)
        return null
      }
      // Re-throw unexpected errors
      throw reverseErr
    }

    if (!reverseName) {
      nameCache.set(key, null)
      return null
    }

    // Ensure it's a Base-related TLD (best-effort)
    if (!VALID_TLDS.some((t) => reverseName.toLowerCase().endsWith(t))) {
      // Not a Base TLD; still allow but mark as valid only if forward resolves
    }

    // Forward validate using the same Base client
    const forwardAddress = await baseClient.getEnsAddress({
      name: reverseName,
      universalResolverAddress: BASENAME_UNIVERSAL_RESOLVER,
    })

    if (!forwardAddress) {
      nameCache.set(key, null)
      return null
    }

    const forwardChecksum = getAddress(forwardAddress)
    if (forwardChecksum.toLowerCase() !== checksum.toLowerCase()) {
      // Mismatch; treat as invalid reverse record
      nameCache.set(key, null)
      return null
    }

    nameCache.set(key, reverseName)
    return reverseName
  } catch (err) {
    // On any failure, do not throw; just return null and avoid crashing UI
    return null
  }
}

/**
 * Clear the local cache (useful for debugging or after profile updates)
 */
export function clearBasenameCache() {
  nameCache.clear()
}
