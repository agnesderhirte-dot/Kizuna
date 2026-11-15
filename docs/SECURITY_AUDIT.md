# Security audit — provisional

This is an implementation review, not an independent audit. Stable release: BLOCKED.

| Control | Status | Evidence / limit |
|---|---|---|
| contextIsolation / sandbox / no Node renderer | PASS | BrowserWindow settings |
| webSecurity / no insecure mixed content | PASS | Explicit settings |
| IPC sender and schema validation | PASS | Main-frame + exact URL; invalid-settings/path tests |
| exhaustive unauthorized-frame IPC tests | FAIL | Not yet tested |
| local scripts and no eval | PASS | Bundled Vite build and CSP |
| navigation, new window, webview restrictions | PASS | Handlers block all |
| external links | PASS | Explicit IPC; HTTPS only |
| media permissions | PASS | App frame only; explicit UI controls and source picker |
| chat XSS | PASS | Literal malicious HTML rendered as text in desktop test |
| invite parsing | PASS | Schema, length, token, query and URL tests |
| server room admission | PASS | Unauthorized creation/wrong-token/capacity tests |
| stable authenticated peer identity | FAIL | Local key exists; not bound to handshake |
| LAN signaling confidentiality | FAIL | Plaintext ws; trusted LAN/VPN only |
| public TLS | PASS | Public ws rejected; wss certificates validated |
| file import | PASS | Size, signature/decode, generated file paths; fuzzing outstanding |
| dependency scan | PASS with note | 0 High, 0 Critical; 1 Moderate build-only minimatch advisory |
| automated updater | NOT APPLICABLE | Not implemented |
| code signing | FAIL | No signing certificate; unsigned development build |
| long session / physical two-PC review | FAIL | Not yet performed |

Dependency audit 2026-11-11: GHSA-g3hv-75wg-m249, moderate minimatch glob amplification in electron-builder development dependencies. No runtime advisory reported by this scan. Fixed minimatch range is >=11.0.1; avoid a blind major override until builder compatibility is verified. Full machine-readable evidence: test-results/dependency-audit.json (local QA output).

Resolved during implementation: WebRTC descriptions lost properties crossing Electron IPC, preventing negotiation; serialize explicit type/sdp. Build failed due to an unnecessary CSS data import; removed. Installer NSIS includes exceeded Windows path length; use a short temporary drive mapping for the build.
