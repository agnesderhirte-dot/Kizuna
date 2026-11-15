# Changelog

## 0.3.1 — 2026-11-15
- Fixed initial WebRTC offer collision: only the joining peer starts negotiation, preserving the data channel when existing participants already share media.
- Local four-peer test with three additional leave/rejoin cycles passed. Public PeerJS signaling test passed with local clients; separate Internet connections remain unverified.
- Packaged fullscreen, movable camera overlays, quality controls, four original Manager-inspired skins, backgrounds, emoji, invitation/mail draft and signed update transfer verified.


## 0.1.0 — 2026-11-11
- New Windows implementation from requirements; no prior code imported.
- Hardened Electron bridge, React interface, SQLite persistence and encrypted secret storage.
- Private signaling, four-peer cap, WebRTC negotiation/ICE handling, audio/video and basic DataChannel chat/sound.
- Quality controls, RTP measurements, custom backgrounds, persistent sound imports, mute/deafen.
- Unit/integration and two-instance desktop verification; development installer pipeline.
- Stable release not approved; hardware/network/soak and feature completion remain open.
