#!/usr/bin/env node
/**
 * Check BountyManager contract fee configuration and transaction details
 * Usage: node scripts/check-fees.js
 */

const { ethers } = require("ethers");

async function main() {
  // Get environment variables
  const rpcUrl = process.env.RPC_URL || "https://sepolia.base.org";
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const txHash = process.env.TX_HASH; // Optional: specific transaction to check

  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable");
    console.log("\nUsage:");
    console.log("  $env:CONTRACT_ADDRESS='0xYourContractAddress'");
    console.log("  $env:RPC_URL='https://sepolia.base.org'  # optional");
    console.log("  $env:TX_HASH='0xYourTransactionHash'     # optional");
    console.log("  node scripts/check-fees.js");
    process.exit(1);
  }

  console.log("🔍 Checking BountyManager Fee Configuration\n");
  console.log("Contract:", contractAddress);
  console.log("RPC:", rpcUrl);
  console.log("");

  // Connect to provider
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Load ABI
  const abi = require("../lib/bounty-manager-abi.json");
  const contract = new ethers.Contract(contractAddress, abi, provider);

  try {
    // Check owner
    const owner = await contract.owner();
    console.log("📋 Contract Configuration:");
    console.log("  Owner:", owner);

    // Check fee settings
    const feePercent = await contract.platformFeePercent();
    const feeCollector = await contract.feeCollector();
    
    console.log("  Platform Fee:", feePercent.toString(), "bps =", (feePercent.toNumber() / 100).toFixed(2) + "%");
    console.log("  Fee Collector:", feeCollector);
    console.log("");

    // Check fee collector balance
    const balance = await provider.getBalance(feeCollector);
    console.log("💰 Fee Collector Balance:");
    console.log("  ETH:", ethers.utils.formatEther(balance));
    console.log("");

    // If transaction hash provided, analyze it
    if (txHash) {
      console.log("🔎 Analyzing Transaction:", txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        console.log("  ❌ Transaction not found (still pending?)");
      } else {
        console.log("  Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
        console.log("  Block:", receipt.blockNumber);
        console.log("  Gas Used:", receipt.gasUsed.toString());
        console.log("");

        // Parse logs to find BountyCompleted event
        const iface = new ethers.utils.Interface(abi);
        const completedEvents = receipt.logs
          .map(log => {
            try {
              return iface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .filter(event => event && event.name === "BountyCompleted");

        if (completedEvents.length > 0) {
          console.log("  📦 BountyCompleted Event:");
          const event = completedEvents[0];
          console.log("    Bounty ID:", event.args.bountyId.toString());
          console.log("    Winner:", event.args.winner);
          console.log("    Reward Amount:", ethers.utils.formatEther(event.args.rewardAmount), "ETH");
          console.log("    Platform Fee:", ethers.utils.formatEther(event.args.platformFee), "ETH");
          console.log("");

          // Verify the fee was actually transferred
          const tx = await provider.getTransaction(txHash);
          const block = await provider.getBlock(receipt.blockNumber);
          
          console.log("  🔍 Fee Transfer Verification:");
          const platformFeeAmount = event.args.platformFee;
          if (platformFeeAmount.eq(0)) {
            console.log("    ⚠️  Platform fee is 0 - check platformFeePercent setting!");
          } else {
            console.log("    ✅ Platform fee calculated:", ethers.utils.formatEther(platformFeeAmount), "ETH");
            console.log("    📬 Fee should have been sent to:", feeCollector);
            
            // Check internal transactions (transfers)
            console.log("\n  💸 Checking if fee was transferred...");
            console.log("    Note: To verify internal transfers, check the transaction on BaseScan:");
            console.log("    https://sepolia.basescan.org/tx/" + txHash);
          }
        } else {
          console.log("  ⚠️  No BountyCompleted event found in this transaction");
        }
      }
    }

    // List recent bounties
    console.log("\n📊 Recent Bounties:");
    const nextBountyId = await contract.nextBountyId();
    console.log("  Total bounties created:", (nextBountyId.toNumber() - 1).toString());
    
    // Check last 3 bounties
    const start = Math.max(1, nextBountyId.toNumber() - 3);
    for (let i = start; i < nextBountyId.toNumber(); i++) {
      try {
        const bounty = await contract.getBounty(i);
        const statusNames = ["Active", "Completed", "Cancelled"];
        console.log(`\n  Bounty #${i}:`);
        console.log(`    Title: ${bounty.title}`);
        console.log(`    Reward: ${ethers.utils.formatEther(bounty.reward)} ETH`);
        console.log(`    Status: ${statusNames[bounty.status]}`);
        console.log(`    Creator: ${bounty.creator}`);
        if (bounty.winner !== ethers.constants.AddressZero) {
          console.log(`    Winner: ${bounty.winner}`);
        }
      } catch (err) {
        // Skip if bounty doesn't exist
      }
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
