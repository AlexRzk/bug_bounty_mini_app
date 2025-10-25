import abiJsonV2 from "./bounty-manager-v2-abi.json";
import abiJsonV3 from "./bounty-manager-v3-abi.json";
import type { Abi } from "viem";

// V2 ABI (Legacy)
export const bountyManagerAbiV2: Abi = abiJsonV2 as unknown as Abi;

// V3 ABI (With Escrow & Time Locks)
export const bountyManagerAbiV3: Abi = abiJsonV3 as unknown as Abi;

export type BountyManagerAbi = Abi;

// BountyManagerV2 deployed on Base Mainnet (Legacy)
export const BOUNTY_MANAGER_V2_CONTRACT = {
  address: "0x5D8DFAe5422090722897FB2CfB5bE2A967f20Ce8" as `0x${string}`,
  abi: bountyManagerAbiV2,
} as const;

// BountyManagerV3 deployed on Base Mainnet (With Escrow & Time Locks)
// Deployed at: 0x3165e828EB446b69DeB1Ebbc074539C57Cb49958 (Base mainnet, 8453)
export const BOUNTY_MANAGER_V3_CONTRACT = {
  address: "0x3165e828EB446b69DeB1Ebbc074539C57Cb49958" as `0x${string}`,
  abi: bountyManagerAbiV3,
} as const;

// Default to V3 (mainnet)
export const BOUNTY_MANAGER_CONTRACT = BOUNTY_MANAGER_V3_CONTRACT;

// Export legacy for backward compatibility (if needed elsewhere)
export const bountyManagerAbi = bountyManagerAbiV3;

