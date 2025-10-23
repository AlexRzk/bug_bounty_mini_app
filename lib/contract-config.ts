import abiJson from "./bounty-manager-v2-abi.json";
import type { Abi } from "viem";

// Provide a small, stable ABI type instead of exporting a huge literal type.
export const bountyManagerAbi: Abi = abiJson as unknown as Abi;
export type BountyManagerAbi = Abi;

// BountyManagerV2 deployed on Base Mainnet with deadline functionality
export const BOUNTY_MANAGER_CONTRACT = {
  address: "0x5D8DFAe5422090722897FB2CfB5bE2A967f20Ce8" as `0x${string}`,
  abi: bountyManagerAbi,
} as const;
