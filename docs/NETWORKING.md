# Networking

Host starts a WebSocket signaling server on TCP 8765. Loopback mode listens on 127.0.0.1. Explicit LAN mode listens on all IPv4 interfaces; the selected LAN/VPN address is placed in the invite. Windows Firewall may require user action. The app does not alter firewall/router configuration or install a VPN.

LAN/VPN invitations use ws://. Treat the LAN as trusted; ws does not encrypt signaling or invite secrets. Prefer a trusted encrypted VPN when using the embedded server between different homes. Do not expose TCP 8765 to the public internet unprotected. Public/custom endpoints must use wss://. A TLS reverse proxy may expose the standalone server. Certificate validation is not bypassed. Merely accepting a wss invitation does not create a public server.

WebRTC uses host candidates and Cloudflare STUN. STUN receives connection metadata but does not carry screen/audio streams. TURN is optional and user-configured. TURN carries media when selected and consumes server bandwidth. Automatic Tailscale detection is not implemented. A working Tailscale/VPN IP may be entered explicitly; routing still depends on Chromium ICE and the local network.

No media time quota exists. WebSocket heartbeat detects dead sockets. Connection errors retry with exponential backoff capped at 30 seconds; authorization rejection does not retry. A successful rejoin creates a new session peer ID and renegotiates existing local tracks. ICE restart handles failed peer connections. Reconnect and long-session behavior require further real network testing.

Room sessions are held in server memory. Empty rooms are removed after 24 hours; active rooms are not timed out. Restarting the host server currently removes rooms. Future room persistence must preserve encrypted secrets and owner permissions.

Cost/technical limits: mesh sends N-1 copies of a stream. Four participants with 8 Mbit/s per recipient require roughly 24 Mbit/s sender upload plus overhead. 4K/60 are requests, not guarantees. Screen dimensions and FPS come from actual RTP reports. No forced codec or guaranteed hardware encoder is claimed.
