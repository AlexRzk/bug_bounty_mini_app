Sensitive admin scripts

This folder contains operations and admin scripts that perform privileged actions
against deployed smart contracts (for example: setting the fee collector, sending
on-chain transactions, or using private keys). They are moved out of the main
`scripts/` folder to reduce accidental exposure and clutter in the primary
application view.

Important:
- These scripts may require a private key, `.env` file, or other secrets to run.
- Never commit private keys or secrets to the repository. Use environment
  variables or a secure secret manager.
- Treat these files as sensitive. If you need to run them, run locally in a
  secure environment, and consider moving them to a separate, private repo for
  ops automation.

Files moved here:
- `set-fee-collector-auto.mjs` — non-interactive setter using `contracts/.env`
- `set-fee-collector.mjs` — param-driven setter using env vars
- `update-fee-collector-interactive.mjs` — interactive owner helper

How to run safely (example):
1. Create a local `.env` file outside the repository with your `PRIVATE_KEY`.
2. Export environment variables in the shell before running.
3. Run the script with Node: `node ops/set-fee-collector.mjs`

If you want these scripts removed entirely from the repository, delete this
folder and its contents once you have a private copy.
