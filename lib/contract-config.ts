import abiJson from "./bounty-manager-abi.json";
import type { Abi } from "viem";

// Provide a small, stable ABI type instead of exporting a huge literal type.
export const bountyManagerAbi: Abi = abiJson as unknown as Abi;
export type BountyManagerAbi = Abi;

export const BOUNTY_MANAGER_CONTRACT = {
  address: "0x3e2ca92C48FE3BbF0c83c6E69DcE680BA63C193B" as `0x${string}`,
  abi: bountyManagerAbi,
} as const;
