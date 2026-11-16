## Stand 2026-11-16 – Nacharbeit zu Spielsound und Audioverzögerung
- Zuletzt geprüfter Quellcommit: `f496c99084580b2fc7fcdc863bc19d86025b20db`; GitHub Actions: https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43817017128 (**Build grün; 34/35 Unit-Tests erfolgreich, einer übersprungen**).
- Per-Stream-Stummschaltung in `src/VideoStage.tsx` und `src/main.tsx`. In der Stream-Toolbar wird der Spielsound jedes fremden Teilnehmers separat geschaltet; RemoteAudio rendert nur andere Audioarten, Soundboard bleibt unabhängig.
- Bildschirm und sein Ton werden in einem HTMLVideoElement synchron abgespielt. Andere Screens haben im Fokusmodus Audio-only-Fallback.
- `Mesh.sound` prüft Empfänger-Acknowledgements und Cache, sendet Sounddateien nicht bei jedem Klick erneut; kürzere Wiedergabeverzögerung für neue Clients; alter Client-Fallback. Voraussichtliche lokale Scheduling-Verzögerung 160ms, **keine End-to-End-Garantie**.
- `QualityDiagnostics` erfasst aus WebRTC-Statistiken auch playout buffer und kaschierte Audio-Samples.
- **Offen**: Hardware-/Sprach-/Audio-Lag-Test mit zwei echten PCs, Ton-Sync-Verifikation bei Netzwerklast, 1440p60-Benchmark. Kein Merge, Release oder Client-Update erfolgt.
- Zuletzt: Roadmap `docs/MASTER_ROADMAP.md` und Entwicklungsprotokoll `docs/DEVELOPMENT_PROGRESS.md`. Während der aktiven Entwicklung sind neue CI-Läufe zu prüfen, bei nächstem Commit erneut validieren.

# KIZUNA – aktueller Entwicklungs-Handoff 16.11.2026

**Dieser Abschnitt ergänzt die historische KIZUNA-0.3.2-Übergabe unten; alte Testergebnisse gelten nicht automatisch für neue Funktionen.**

- GitHub: `agnesderhirte-dot/Kizuna`.
- Entwicklungsbranch: `feat/retro-modern-skins`; Draft-PR #1: https://github.com/agnesderhirte-dot/Kizuna/pull/1.
- Neu: neun Skinvarianten mit Skin-Galerie, Streaming-Fokusmodus, pegelbasierte Mikrofon-Sprechererkennung und skinabhängige Ränder, Remote-Zustände über bestehenden WebRTC-Datenkanal, Fußball-/Standardreaktionen (TOR/VAR/ELFMETER) mit maximal sechs Reaktionen pro drei Sekunden und lokalen Stream-Overlays.
- Dauerhafte Aufgabenliste: `docs/MASTER_ROADMAP.md`; lückenloser Arbeitsstand: `docs/DEVELOPMENT_PROGRESS.md`.
- Build und Unit-Tests **grün**: GitHub Actions `validate` Run 43775020122, SHA `4a57166b0a3a62af7a028f7bf00b1775dcb99469`; TypeScript + Vite bestanden, 24/25 Tests bestanden, einer übersprungen. Frühere CI-Fehler behoben.
- Kein neuer Installer, kein Merge in `main`, keine Update-Publikation. Nutzerfreigabe vor Release zwingend.
- **Wichtige Grenze**: Sprecheraktivität ist eine ressourcenschonende RMS-/dB-Heuristik, keine sprachspezifische VAD. Reale Mikrofon-, Audio-, Zwei-PC-, Windows-GUI- und 1440p60-Tests stehen aus.
- Nächste Schritte: Sichtprüfung Skins/Sprecher/Emojis auf zwei PCs, Mikrofontest und Analyse schlechter Audioqualität; 1440p60-Messung; sichere zentrale Updates nach bestätigter Signatur-/Release-Konfiguration.
- Schlüssel, App-ID, `voxrally://`, lokaler Datenpfad und bestehende Update-Vertrauensbasis unverändert lassen.

---

# KIZUNA 0.3.2 – Übergabe 15.11.2026

## Stand
Windows-Testbuild erstellt. Verbindungskorrekturen lokal und mit öffentlichem PeerJS-Signaling geprüft. Keine vollständige Produktionsabnahme: zentrale Veröffentlichung/Windows-Signatur fehlen, realer Zwei-PC-Test offen.

## Behoben
- Online-Abbruch reproduziert: verschlüsseltes SDP überschritt PeerJS-JSON-Limit 16.300 Byte; Fehler `message-too-big`. Jetzt binäre PeerJS-Serialisierung mit automatischer Segmentierung, bestehende verschlüsselte Nutzdaten unverändert.
- Pro Peer geordnete Offer/Answer-/ICE-Verarbeitung; Antwortstatus wird auch nach Fehler zurückgesetzt.
- Begrenzter ICE-Restart, automatischer Wiederbeitritt nach Bootstrap-Abbruch, Bereinigung nicht geöffneter Verbindungen bei Timeout. Erneute Host-Registrierung beim Signaling-Dienst löscht keine laufende Raumverbindung.
- Sichtbarer Name KIZUNA, Layout unverändert. Paketname voxrally, appId de.voxrally.desktop, ausführbare Datei VoxRally.exe, voxrally://, Datenordner %APPDATA%/VoxRally und bestehender Ed25519-Schlüssel bleiben erhalten.

## Prüfungen
- TypeScript und Produktionsbuild bestanden; 13 gezielte Unit-/Integrationstests bestanden (12 im Gesamtlauf plus neuer Cloud-Reconnect-Test).
- Zwei getrennte Electron-Prozesse: Chat, gleichzeitig beidseitige synthetische Screens und Kameras, eingehende Audio-RTP-Daten; unabhängiges Kamera-/Mikrofon-Schalten bestanden.
- Finaler gepackter Build über öffentliches PeerJS-Signaling: dieselben Medienprüfungen bestanden. Erzwungener Bootstrap-Abbruch: automatische Wiederverbindung, empfangener Bildschirm und Chat bestanden.
- Log: test-results/kizuna-032-packaged-online.log. App-Name KIZUNA und Version 0.3.2 im gepackten Prozess geprüft.
- Installer gebaut, SHA256 und Ed25519-Manifest mit vorhandenem Schlüssel geprüft. Keine Installation über das aktive Nutzerprofil, kein realer Update-von-installiert-zu-installiert-Test.
- Keine aktuelle Hardware-Kamera-/Mikrofonabnahme, kein realer Zwei-PC-/Zwei-Netze-Test. Restriktive NATs benötigen weiterhin geeigneten TURN-Zugang oder VPN; kein öffentlicher TURN eingebaut.

## Zentraler Updater: vorbereitet, nicht produktiv
electron-updater 6.8.11 mit NSIS. Aktivierte Releases prüfen beim Programmstart Stable-Versionen; Dialog „Jetzt aktualisieren“/„Später“, Download nach Zustimmung, Installation erst außerhalb aktiver Räume/Streams. Automatische Installation beim Beenden ist deaktiviert. Tests prüfen Zustimmung, Stream-Sperre einschließlich Race beim Dialog sowie fehlende Signatur.
SHA512-Integritätsprüfung durch electron-updater plus strikt gültige Windows-Authenticode-Signatur mit festem Zertifikats-Fingerabdruck. Kein unsicherer Fallback bei fehlendem PowerShell/ungültiger Signatur.
Blocker: kein GitHub-Release-Repository/Veröffentlichungszugang und kein Windows-Code-Signing-Zertifikat bekannt. desktop/release-channel.json bleibt deshalb disabled. Dieser Installer hat KEINE Authenticode-Signatur; sein Ed25519-Manifest dient ausschließlich dem bestehenden kompatiblen P2P-Updatepfad und ersetzt sie nicht.
Zentrale latest.yml und app-update.yml werden erst beim konfigurierten Release erzeugt. Keine fingierten Metadaten und keine Veröffentlichung erfolgt.

## Wiederholbarer Release
Bestehendes Projekt: C:\Users\MatthiasAlbrechtBeru\Documents\Codex\2026-11-11\x20-text-color-secondary-size-xs-2\outputs\voxrally
Kurzer Buildpfad (NSIS): C:/Users/MatthiasAlbrechtBeru/Documents/Codex/vr-build-01a1c9. Geänderte Quellen, package.json und Lockfile synchronisieren; Abhängigkeiten mit pnpm install --frozen-lockfile aus Lockfile installieren, keine node_modules kopieren.
Lokaler Testbuild: pnpm dist (bestehender Ed25519-Schlüssel muss erhalten bleiben).
Zentraler Release: KIZUNA_GITHUB_OWNER, KIZUNA_GITHUB_REPO, KIZUNA_PUBLISHER_NAME, KIZUNA_CERT_THUMBPRINT und CSC_LINK/WIN_CSC_LINK plus CSC_KEY_PASSWORD sicher setzen; `node scripts/release.cjs` baut signiert mit Metadaten. Für Veröffentlichung zusätzlich GH_TOKEN und `--publish`. Keine Zugangsdaten in Quellen/App speichern. Skript verweigert fehlende Konfiguration.
Danach echten installierten Versionswechsel einschließlich Datenerhalt und laufender Stream-Sperre testen, bevor der zentrale Updatepfad als abgenommen gilt.

## Installer
C:\Users\MatthiasAlbrechtBeru\Documents\Codex\2026-11-15\is\outputs\KIZUNA-0.3.2\KIZUNA-Setup-x64.exe
Quellprojekt-Release: C:\Users\MatthiasAlbrechtBeru\Documents\Codex\2026-11-11\x20-text-color-secondary-size-xs-2\outputs\voxrally\release\KIZUNA-Setup-x64.exe
Größe: 133109871 Bytes; SHA256: 3e9d2b2986cb8f49da3b491a350c8e106607ae0ad9c659c91cc93edcd486c83f
Beide Teilnehmer müssen 0.3.2 installieren. Einmalige manuelle Installation für diesen noch nicht zentral angebundenen Stand erforderlich.
Die bisherige automatische Fünf-Minuten-Überwachung wurde beendet.

---
## Historische Übergaben (durch obigen Stand ersetzt)

## Aktueller Release 0.3.1 – 15.11.2026
Initiale Verhandlungsschleife behoben: nur beitretender Peer startet das erste Angebot, damit SCTP nicht durch ein kollidierendes Medienangebot verloren geht. Vier lokale Clients und drei weitere Wiederbeitritte bestanden (rejoin-stress.log). Online-Signaling-Test bestanden (online-031.log). Gepackter Funktionstest bestanden (packaged-031.log). Vier vorhandene Manager-Skins geprüft. Sieben Sicherheitstests bestanden. Keine echte Zwei-PC-Internetabnahme, kein mitgeliefertes TURN. Frühere Aussagen zur weiterhin reproduzierbaren Schleife in 0.3.0 gelten für den alten Stand. Details siehe release/START-HIER.txt.

## Finaler Release 0.3.0 – geprüft
Die endgültige gepackte EXE bestand den Zwei-Instanzen-Test einschließlich eigenem/fremdem Vollbild, Kameras, Live-Qualität, Mail-Entwurf (kein Versand), Bildhintergrund beim Empfänger und signierter Updateübertragung (keine Testdateiausführung). Sieben Sicherheits-/Update-/Server-Tests bestanden. release/VoxRally-Setup-x64.exe.update.json ist erstellt; Signatur und Installer-Hash geprüft. Beide Teilnehmer müssen 0.3.0 zunächst manuell installieren, danach sind P2P-Updates verfügbar. Windows kann Benachrichtigungen im Spiel durch Nicht-stören/Fokus unterdrücken; In-App-Hinweis bleibt.

## Letzte Abschlussnotizen 0.3.0
- Updatefunktion ergänzt: eigener DataChannel, Versionshinweis, Windows-Toast, vom Nutzer bestätigter Download/Installation. Ed25519 + SHA256, begrenzte Dateigröße, geordnete Blöcke, Empfang nur nach Zustimmung. Test mit signierter 100-KB-Datei erfolgreich; Testdatei niemals ausgeführt.
- Privater Release-Schlüssel liegt ausschließlich build/private/update-key.pem (gitignored), öffentlicher Schlüssel desktop/update-public.pem. Für zukünftige Updates bewahren. sign-update.cjs nach jedem Release zwingend ausführen.
- WICHTIG: Vier-Personen-Stresstest mit schnellem Wiederbeitritt ist weiterhin intermittierend instabil (Signaling-Limit erreicht). Die Anpassung auf 600 Nachrichten/10s und 2MB/10s behebt den vorherigen Fehler nicht vollständig. Schutz nicht weiter blind erhöhen. Zwei-Personen-Featuretest besteht; früherer einzelner Vier-Personen-Cloud-Lauf bestand, ist keine Stabilitätsgarantie.
- Echter Toninhalt (leiser Testton) wird beim Empfänger dekodiert und abgespielt; hörbare Ausgabe muss Nutzer bestätigen. BlackShark-Mikrofon lieferte im Hardwaretest keinen Pegel.

## Update 15.11.2026 – Version 0.3.0
- Vollbild für eigene und fremde Screens, Kameras als verschiebbare Overlays. Qualität und Sounds im Vollbild erreichbar.
- Kopier-/Direktlink plus Mail-Entwurf ohne automatischen Versand. Vier eigenständige Manager-Skins, Smiley-Auswahl, lokaler Kameratest/Mikrofonpegel/Testton.
- Webcam: wählbares Gerät, 720/1080p, separate Bitrate, lokale Personensegmentierung mit Blur/eigenem Bild. Modell/WASM offline enthalten; ohne Effekt wird die Bibliothek nicht geladen.
- Echte Hardware: Anker PowerConf C200 lieferte 1920x1080@30 und 46 Bilder in 1,5 Sekunden. BlackShark-V3-Mikrofon öffnet mit 48kHz, aber Messpegel 0 (Stille/Stummschaltung nicht unterscheidbar). Kein reales Kamerabild gespeichert.
- Lokale Tests: eigener/fremder Vollbildwechsel, fortlaufende Frames, Drag, Live-Bitrate, Invite/Mail-Entwurf mit abgefangenem Mailaufruf, Smiley beim Empfänger, Skin, Blur, eigenes Hintergrundbild beim Empfänger bestanden.
- Vier lokale Clients über PeerJS Cloud inklusive Wiederbeitritt und Soundboard erfolgreich; keine Zwei-PC-Internet-Abnahme. Alter Cloud-Sturm im vorherigen Stand in diesem Lauf nicht reproduziert.
- Race beim LAN-Wiederbeitritt behoben: späte ICE-Nachricht an bereits verlassenen Peer wird verworfen, ohne den Sender aus dem Raum zu werfen; Regressionstest ergänzt.
- Build-Cache im kurzen Build-Verzeichnis war durch ältere Dateikopien inkonsistent. Abhängigkeiten dort mit neuem Store aus Lockfile wiederhergestellt. Keine node_modules zwischen Verzeichnissen kopieren.

## Update 15.11.2026 – Version 0.2.0
- Anforderungen: docs/DEVELOPMENT_PROMPT.md. Ressourcensparend, keine neuen Abhängigkeiten.
- Viereransicht, Fokus auf fremden Bildschirm, Vollbild mit verschiebbaren kleinen Kameras. Eigener Bildschirm wird weitergesendet.
- Webcam ideal 1080p30 / 4 Mbit/s; Bildschirm-Preset native30 / 20 Mbit/s. Bestehende Einstellungen bewusst erhalten; Preset speichern und Freigabe neu starten.
- TypeScript und Produktionsbuild erfolgreich; 4 Sicherheit/Signaling-Tests bestanden. Gezielter Zwei-Instanzen-Test: bewegte synthetische 1080p-Bildschirme und Kameras, 2x2, Vollbild, Drag, fortlaufende Frames und Rückkehr bestanden. Das virtuelle Chromium-Kameragerät lieferte nur ein 2x2-Standbild; daher bewegte Canvas-Kameratestquellen benutzt. Echte Kameraqualität nicht verifiziert.
- NSIS-Installer release/VoxRally-Setup-x64.exe neu erstellt; gepackte App erfolgreich gestartet. Keine erneute Installation über ein Nutzerprofil durchgeführt.
- Öffentliches Cloud-Signaling bleibt wegen früherer Rejoin/Mehrteilnehmer-Probleme experimentell. Diese UI-Änderung behebt das nicht. Keine Zwei-PC-Internet-Abnahme.

# VoxRally Development Handoff

## Current Version
0.1.0 development installer exists; online PeerJS signaling is being added to source and has not yet been packaged/accepted.

## Current Branch
New local repository; initial commit pending. No previous ChatGPT source ZIP was available.

## Current Model
GPT-6 Astra. User preference: continue without questions; resource-conscious implementation, testable today.

## Last Completed Milestone
Local x64 installer built (122,498,339 bytes), silently installed into an isolated test directory, installed EXE launched successfully with test profile. Not a clean Windows-machine test.

## What Works
TESTED locally: four Electron instances; room admission; chat/XSS text; fake microphone streams; two simultaneous synthetic 1920×1080 screens; sound import and remote playback; chat retention on rejoin; background and identity persistence after full process restart. Compiled renderer and packaged EXE launch. Unit/integration tests: 4 passing.

## What Does Not Work Yet
The full master prompt is not complete. No VERIFIED ON TWO PCS result. No physical microphone/screen/system-audio quality acceptance. No completed 1-hour or 4-hour soak. Roles/channels/friends/Stream Deck/general file transfer/custom emoji transport/scenes/backup/full chat synchronization/automatic quality controller remain open. Stable cryptographic peer identity is not bound to the network handshake.

## Architecture Decisions
Electron hardened main/preload; React/TS; SQLite via node:sqlite; native WebRTC mesh. Optional embedded LAN signaling. New online mode uses free shared PeerJS Cloud only for discovery; an encrypted bootstrap DataChannel carries further room signaling. Invite-derived AES-GCM protects room signaling, challenge admission and ordered envelopes. Media stays on native direct mesh connections. Public TURN is not bundled; symmetric NAT can still require user-provided TURN/VPN. No free service availability guarantee.

## Files Changed
desktop/, src/, tests/, scripts/, docs/, package/lockfile, build/icon.ico. Public-cloud additions: src/cloud.ts, host/join branch, CSP allowlist and online toggle.

## Dependencies Added
Locked Electron 45.3.0, React 19.3.1, Vite 8.3.8, TypeScript 7.0.2, ws 8.22.2, Zod 4.6.7, electron-builder 26.18.0, Playwright 1.65.0, PeerJS 1.5.5.

## Database Changes
user_version=1: kv/assets/messages. Private identity, TURN password and persisted host invite encrypted with safeStorage. Online host invite also encrypted at rest.

## Commands To Run
Node is bundled in the Codex runtime; pnpm is under dependencies/bin/fallback/pnpm.cmd. Dependencies were installed using the workspace work/pnpm-store, so direct node CLI commands avoid pnpm's local store mismatch checks:
```
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build
node --test tests/*.test.cjs
node scripts/smoke.cjs
node scripts/package-smoke.cjs
```
Set VOXRALLY_CLOUD_TEST=1 for the same desktop test through public signaling. Set VOXRALLY_SOAK_HOURS=4 for actual wall-clock soak (not started successfully yet). Network/GUI operations require the normal approved execution context.

## Tests Passing
Local tests listed above. Online two-peer core progressed through chat/media/sound, but the public four-peer case failed and is under diagnosis. Do not treat partial public test progress as full acceptance.

## Tests Failing
Public online four-person/rejoin test: some bootstrap connections close and peers become disconnected. Added limited console diagnosis in cloud.ts; no secrets or packet contents logged.

## Known Bugs
No turnkey TURN fallback for restrictive networks. Room owner must keep app open. Stable room/community model not finished. Test harness must use unique profiles per run to avoid duplicate messages from prior runs. Audio rendering was moved outside view-specific content so it survives Settings/Soundboard navigation.

## Security Findings
See docs/SECURITY_AUDIT.md. Last pre-PeerJS dependency audit: 0 High/Critical, 1 Moderate build-only minimatch advisory. Repeat after new dependency. Independent review and physical tests remain release gates. Do not call development installer audited or stable.

## Current Blockers
At about 10:56 local, automatic approval review rejected cleanup and background soak due to usage limit. That command did not run. At 16:18 local, usage tool reports ordinary use allowed again, 97% five-hour remaining but only 4% weekly remaining. No reset credits available. User has returned and requests status plus continued work.

## Exact Next Task
Diagnose public bootstrap disconnect, run public four-peer test, build updated installer from short staging path, test package, refresh audit/checksums/README, complete local test cleanup, then start real soak only if execution and follow-up are actually active. Address open product features; do not imply completion from installer alone.

## Do Not Change
No paid services, no silent firewall/router modifications, no copyrighted bundled assets, no artificial media caps/timers, no false quality/test claims. User explicitly requested no more clarification questions.

## Cost Status
No purchases or paid hosting. PeerJS Cloud documented free; shared service without SLA. Public free TURN discontinued by PeerJS. Direct P2P is free of VoxRally streaming fees but cannot guarantee connectivity on all networks.

## Local Build Notes
NSIS fails on long source dependency paths. Successful staging directory: C:/Users/MatthiasAlbrechtBeru/Documents/Codex/vr-build-01a1c9. Copy source (exclude node_modules/release/.git/.test-data/test-results), install same lockfile there and run builder with output pointing to this project's release folder. Temporary V: mapping to the source was insufficient and may still exist in the elevated execution context. Test installation remains under .test-data/installed; cleanup was rejected with the soak command. Check before removing only that test installation.
