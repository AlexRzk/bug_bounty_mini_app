import abiJson from "./bounty-manager-abi.json";
import type { Abi } from "viem";

// Provide a small, stable ABI type instead of exporting a huge literal type.
export const bountyManagerAbi: Abi = abiJson as unknown as Abi;
export type BountyManagerAbi = Abi;

export const BOUNTY_MANAGER_CONTRACT = {
  address: "0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf" as `0x${string}`,
  abi: bountyManagerAbi,
} as const;
