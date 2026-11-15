# Test matrix

Status categories: IMPLEMENTED, TESTED (local automated), VERIFIED ON TWO PCS, IMPLEMENTED – NOT YET VERIFIED. No feature currently has VERIFIED ON TWO PCS status.

Commands (Node and pnpm for developers only):
```
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:desktop
pnpm audit
pnpm dist
```

Tests use isolated .test-data directories. Desktop tests launch two real Electron instances, use fake microphone devices and synthetic canvas screen tracks, and verify actual peer receipt. They do not certify physical capture, audible quality, system loopback or two different computers. test-results/two-peers.png captures the test UI.

Verified locally: TypeScript compile, Vite production build; 4 protocol/security tests; desktop startup; SQLite profile settings; rejected invalid IPC payloads/asset paths; room creation/join; two-peer DataChannel; literal XSS text; bidirectional fake audio; simultaneous 1920×1080 synthetic streams; mute/deafen UI. Additional sound/persistence/reconnect checks are tracked in HANDOFF.md as executed.

Required before stable release:
1. Install on clean Windows 10/11 x64 without Node/npm; uninstall/reinstall preserves data.
2. Two physical PCs on different internet connections: correct invitations, voice both ways, actual selected screen/window and loopback audio both ways, simultaneous streams.
3. 3- and 4-person mesh; packet loss/jitter/RTT; fallback TURN; VPN route.
4. Requested vs actual 1080/1440/4K and 30/60 FPS; FM text readability, shooter movement, encoder load.
5. Sound import/hash/chunks/clock/cooldown, silent/disabled peers, cached replay.
6. Background and sound persistence after full process restart, database migration and backup restoration.
7. Real network interruption and recovery; no duplicate tracks/listeners or phantom participants.
8. 1-hour then 4-hour soak with memory/CPU/audio-sync measurements; do not replace elapsed wall time with an accelerated claim.
9. Complete malicious peer/IPC/file/security test matrix and separate adversarial review.

Not implemented: roles/private channels/friends; persistent room ownership and revocation; stream scenes; custom emoji transport/reactions; general file transfer; full chat history sync/edit/delete/reply; Stream Deck plugin/LAN remote; global hold-to-talk; automatic quality controller; backup export. These are not accepted merely because related UI controls or foundational APIs exist.
