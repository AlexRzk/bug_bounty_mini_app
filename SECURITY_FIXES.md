# Security Fixes & Hardening Notes

This project interacts with smart contracts, so we prioritize secure defaults across both the on-chain and client layers. Key security safeguards include:

- **Base Mainnet Configuration:** RPC endpoints, chain IDs, and contract addresses are locked to Base mainnet in `minikit.config.ts` and `lib/wagmi-config.ts` to prevent accidental testnet calls in production.
- **Scoped Contract Access:** The app only exposes read-only contract interactions from the Wagmi client. Mutating actions go through curated submission flows reviewed by bounty managers.
- **Environment Isolation:** Sensitive values (API keys, RPC URLs, signer keys) are loaded from environment variables and never committed to source control.
- **Submission Sanitization:** User-provided submission content is stripped of HTML, normalized for length, and stored with metadata to minimize injection risks.
- **Monitoring Hooks:** The on-chain contracts emit events that downstream services use to monitor unusual patterns and flag potential abuse.

To request additional security fixes or report vulnerabilities, reach the maintainers through the bounty program’s official channel or submit a disclosure via the mini app itself.
