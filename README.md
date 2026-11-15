# VoxRally 0.1.0 — engineering alpha

Windows desktop application for private P2P gaming sessions. This new implementation was built from the supplied requirements; the previous ChatGPT source ZIP was not available.

Implemented core: Electron/React/TypeScript, SQLite settings/history/assets, private 4-person session rooms, WebRTC microphone/camera/screen tracks, optional Windows system audio, parallel screen streams, requested quality profiles, actual RTP statistics, basic chat, imported backgrounds and soundboard, encrypted local secrets, global mute/deafen.

This is not yet the complete master-prompt product or a stable release. See docs/TESTING.md and HANDOFF.md for exact evidence and missing work. The Windows installer is a prototype until clean-install and physical two-PC tests pass.

## Usage
1. Install the development installer when available under release/.
2. Open Settings, set your name and save.
3. On a trusted LAN or an existing VPN, one person creates a room. Use the reachable LAN/VPN IPv4 address if automatic selection is wrong.
4. Copy the invitation and give it privately to friends. They paste it and join.
5. Enable microphone explicitly. Select Screen sharing, then choose a source. System audio captures the whole system mix when enabled.
6. Each person may share a screen simultaneously. Import your own sounds/backgrounds. No copyrighted sports/game media is bundled.

There is no pre-provisioned public server. An invitation with 127.0.0.1 is only valid on the same PC. Different internet connections require a working VPN or a reachable TLS-protected signaling setup. Do not port-forward the plaintext embedded server to the internet.

## Developer setup
Node 24+, pnpm; `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm start`. `pnpm test` checks security/protocol. `pnpm test:desktop` checks two local instances. `pnpm dist` builds x64 NSIS. Use a short checkout path for NSIS on Windows.

Runtime does not require Node/npm on the recipient's PC. User data belongs to Electron's per-user application-data directory. No paid services, automatic updates or background startup registration are enabled.
