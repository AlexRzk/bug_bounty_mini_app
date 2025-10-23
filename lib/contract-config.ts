import abiJson from "./bounty-manager-v2-abi.json";
import type { Abi } from "viem";

// Provide a small, stable ABI type instead of exporting a huge literal type.
export const bountyManagerAbi: Abi = abiJson as unknown as Abi;
export type BountyManagerAbi = Abi;

export const BOUNTY_MANAGER_CONTRACT = {
  address: "0x2b532aB49A441ECDd99A4AB8b02fF33c19997209" as `0x${string}`,
  abi: bountyManagerAbi,
} as const;
