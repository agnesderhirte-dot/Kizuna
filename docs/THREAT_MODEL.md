# Threat model

Assets: microphone/camera/screen, invite and TURN secrets, local identity, chat history, imported files, operating-system privileges.

Trust boundaries: remote peer → DataChannel; remote server → main process → renderer; renderer → IPC; imported files → decoders; deep link → invite parser; local control integrations (not implemented).

Threats and current controls:
- Remote script injection: React text escaping, local-only scripts, CSP, no arbitrary navigation/windows/webviews.
- Privileged renderer calls: sandbox, context isolation, no Node integration, exact sender frame/URL checks, fixed IPC names, runtime schemas.
- File traversal: generated hash paths, no arbitrary write/save IPC; format checks and image decode on local import.
- Room guessing: random room and 256-bit secret; host-only room creation key; 4-peer room cap.
- Sender spoofing at relay: server replaces sender IDs; stable cryptographic peer verification remains open.
- Memory/CPU abuse: WebSocket size/rate/connection limits, bounded room count, bounded candidate queue, chat retention, 10 MB sound transfers, bounded sound cache, transfer deadlines and cooldowns.
- Credential leakage: DPAPI at rest, no intentional secret logging, no renderer storage, validated HTTPS external links. LAN signaling remains plaintext and requires a trusted network/VPN.
- Malicious update: P2P-Updateprüfung und zentraler Updatecode existieren. Der zentrale Releasekanal bleibt bis zur vertrauenswürdigen Signatur- und Windows-Abnahme deaktiviert.

Open review areas: malicious signaling host, local port denial of service, decoder resource amplification, replay/clock manipulation, memory stabilization over hours, exhaustive IPC frame tests, invite revocation, stable identity authentication. These block a full stable-release sign-off.

## Ergänzende Schutzmaßnahmen vom 16.11.2026
- Browser-ICE-Kandidaten nur nach Typ-/Längenprüfung verarbeiten; doppelte WebRTC-Nachrichten-/Updatekanäle abweisen.
- Für Sounddaten nur Hash-Bestätigungen akzeptieren, die dem Peer zuvor angeboten wurden, und maximal 32 akzeptierte Cacheeinträge vorhalten.
- Beim Verlassen einer Sitzung Sound-Transfers, Audio-Timer und Peer-Streamreferenzen aufräumen.
- Cloud-Signaling: maximal 2 MiB Nachrichten pro 10 Sekunden sowie jeweils 512 KiB pending inbound/outbound; keine Verarbeitung veralteter Link-Nachrichten.
- Native Rasterbilddekodierung nur nach Prüfung der Headerdimensionen und des Pixelbudgets (PNG/JPEG/GIF/WebP).
- `pnpm audit --prod --audit-level high` als CI-Release-Hürde; letzter Runtime-Scan meldete keine bekannten Sicherheitslücken.
- Weiterhin offen: überprüfte dauerhafte Peeridentität, Klartext-LAN-`ws://`, bösartige Host-/Decoder-Fuzztests, Hardware-Dauertest und signierte Releasekette.
