import abiJson from "./bounty-manager-abi.json";
import type { Abi } from "viem";

// Provide a small, stable ABI type instead of exporting a huge literal type.
export const bountyManagerAbi: Abi = abiJson as unknown as Abi;
export type BountyManagerAbi = Abi;

export const BOUNTY_MANAGER_CONTRACT = {
  address: "0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a" as `0x${string}`,
  abi: bountyManagerAbi,
} as const;
