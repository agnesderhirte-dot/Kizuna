# VoxRally architecture — 2026-11-11

This is a new implementation. The earlier ChatGPT ZIP was not available. Version 0.1.0 is an engineering alpha, not the complete requested product.

Electron 45 hosts a bundled React/TypeScript renderer. The renderer has no Node access. Its preload exposes a fixed IPC allowlist. The main process validates the sender frame, URL and arguments, owns SQLite, imports, Windows-encrypted secrets, the optional local signaling server and the signaling WebSocket client. Vite emits local static assets. No remote application scripts are loaded.

The media layer uses one RTCPeerConnection per remote participant, up to four participants. Microphone, camera and screen use separate MediaStreams. A screen may include a separate loopback audio track. Perfect negotiation resolves simultaneous offers. ICE candidates are queued until a remote description exists. DTLS-SRTP and SCTP/DTLS are provided by Chromium. Sender bitrate is set per recipient; measured RTP stats are displayed separately from requested quality.

The DataChannel carries bounded chat and chunked sound assets. Sound files are SHA-256 checked, cached in a bounded in-memory cache and triggered using an approximate ping/pong clock offset. This is not a precision synchronized audio system. Imported local sounds and backgrounds are persistent. Peer sound cache is currently not persistent.

SQLite stores versioned settings, local identity, asset metadata and bounded chat history. Imported files use SHA-256 filenames. Settings and media paths are not exposed as arbitrary filesystem APIs. TURN passwords and private identity are protected with Electron safeStorage (Windows DPAPI). The local identity exists but is not yet bound cryptographically to remote signaling identities; the UI discloses this.

There is one current session room, not yet a persistent multi-community/channel model. Server-issued session IDs prevent claiming a different connected sender ID at the relay. Room admission requires a 256-bit invite secret. This does not protect against a malicious admitted participant or compromised signaling host. No stable-release security sign-off is claimed.

Remaining structural work: stable authenticated peer identities; persistent rooms/channels/roles/friends; full chat synchronization and moderation; file/emoji protocol; remote-control authentication; media topology and signaling interfaces; SFU adapter only when separately implemented. Do not claim these as implemented based on type names or empty adapters.
