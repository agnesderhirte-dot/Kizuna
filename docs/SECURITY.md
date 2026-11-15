# Security policy

This source and installer are an engineering alpha. Do not describe them as audited, production-ready or verified on two PCs. A stable release requires all acceptance gates in TESTING.md, no known High/Critical findings, and a separate review pass without feature work.

Use only with trusted peers and on a trusted LAN or encrypted VPN until network identity and full review are complete. Do not publish private invite links or expose the embedded plaintext server directly to the internet.

Do not store secrets in Git, logs, crash reports or screenshots. Reproduce security issues with synthetic data. Record impact, reproduction, fix and regression test in SECURITY_AUDIT.md. Manual updates only; verify provenance and checksums before installation. A checksum detects accidental corruption but does not authenticate an untrusted download.
