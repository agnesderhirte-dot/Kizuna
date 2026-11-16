# KIZUNA – Sicherheitsprüfung (vorläufig, kein unabhängiges Pentest-Gutachten)

**Stand:** 16.11.2026 · Ausgangsversion 0.3.2 · Entwicklungsbranch `feat/retro-modern-skins` · Draft PR #1.

**Release-Freigabe: WEITERHIN GESPERRT.** Dieser Bericht beschreibt eine Quellcodeprüfung und automatisierte Tests. Er ist kein Beleg für vollständige Sicherheit, reale Windows-Stabilität oder eine signierte Releasekette.

## Automatisierter Prüfstand

- Letzter verifizierter GitHub-Actions-Lauf: [43828763644](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43828763644), Commit `f61ec2a953ab41fc6c40ef0187ce9f642e0047d3`.
- `pnpm build` (TypeScript/Vite): **bestanden**.
- `pnpm test`: **74 bestanden, 0 fehlgeschlagen, 1 übersprungen**.
- `pnpm audit --prod --audit-level high`: **bestanden**, aktuell *No known vulnerabilities found* bei den geprüften Laufzeitabhängigkeiten. Keine Garantie für alle unbekannten Schwachstellen.
- Das `pnpm audit` läuft künftig automatisch für Pull Requests. Entwicklungs-/Buildabhängigkeiten sind damit **nicht** vollständig abgedeckt; der ältere Hinweis auf ein moderates minimatch-Problem in Entwicklungstools aus 11/2026 bleibt bis zu einem gesonderten Scan historisch vermerkt.

## Technische Kontrollen und aktueller Stand

| Risiko / Grenze | Stand | Nachweis und Einschränkung |
|---|---|---|
| Renderer-Sandbox, IPC-Isolation, Navigationsschutz | Bereits zuvor implementiert; Stichprobenprüfung | Electron `BrowserWindow` und IPC-Senderprüfung; umfassende bösartige Frame-Tests noch offen |
| Raum-/Einladungszugriff | Unit-/Integrationstests | Geheimnis-, Raumgrößen- und Signalingtests; kein durchgängiger Nachweis dauerhafter Identität |
| Ungeprüfte ICE-Kandidaten | Verbessert, getestet | `validIceCandidate`: Format-/Längen-/Typgrenzen, bevor Browser-ICE APIs aufgerufen werden |
| Doppelte WebRTC-Datenkanäle | Verbessert, getestet | Je Peer genau ein aktiver Nachrichten- und Updatekanal; weitere Kanäle schließen |
| Gefälschte Sound-Cache-Bestätigungen | Verbessert, getestet | ACK nur für tatsächlich diesem Peer angebotene Hashes, maximal 32 Cache-Einträge |
| Speicher bei Peer-Ausstieg | Verbessert, getestet | Channels, Sound-Transfers, Puffer, gecachte Sounds und geplante Wiedergaben werden aufgeräumt |
| Cloud-Signalisierung: Nachrichtenschlangen | Verbessert, getestet | Grenzwerte für Eingangsbytes, wartende Empfangsdaten und ausgehende Nachrichten; veraltete Link-Nachrichten werden ignoriert |
| Cloud-Signalisierung: Vertraulichkeit und Replay | Bereits vorhanden | AES-GCM über Einladungsgeheimnis, Sequenznummern; aktive Angriffs-/Fuzztests weiter offen |
| Lokaler LAN-Signaling-Traffic | **Offenes Risiko** | `ws://` ist im vertrauenswürdigen LAN/VPN möglich und dort nicht transportverschlüsselt; öffentliche Netze verlangen `wss://` |
| Profilbilder/Hintergrunddateien: Dekompressionslast | Verbessert, getestet | PNG/JPEG/GIF/WebP-Abmessungen und Pixelbudget vor `nativeImage`-Dekodierung prüfen; Decoder-Fuzzing nicht durchgeführt |
| Vertrauliche lokale Zugangsdaten | Vorhandene Implementierung | `safeStorage` auf Windows; Schutz gegen lokalen Malwarezugriff oder kompromittierten Prozess nicht garantiert |
| Soundboard-/Chat-Eingaben | Teilweise getestet | Nachrichtenlängen, Hashes, Peer-Limits, Audio-Dateiobergrenzen, React-Escaping |
| Zentrale automatische Updates | **Vorbereitet, nicht produktiv** | Updatecode und Changelog-Dialog existieren; signierte Publisher-Identität und realer Upgrade-Nachweis fehlen |
| Windows-Codesignatur | **BLOCKIERT** | Kein produktiv eingerichtetes vertrauenswürdiges Publisher-Zertifikat |
| Zwei-PC-/Netzwerk-/Audio-Langzeittest | **OFFEN** | Wird für vollständige Release-Abnahme ausdrücklich benötigt |
| Unabhängige Abschlussprüfung/Pentest | **OFFEN** | Dieser Bericht ist nur die erste interne, quellcodegestützte Audit-Runde |

## Besonders relevante Restrisiken vor einem öffentlichen Release

1. **Authentifizierte Peer-Identität:** Der Einladungszugriff ist nicht gleichbedeutend mit einer kryptografisch dauerhaft bestätigten Benutzeridentität. Ein vertrauenswürdiger Peer-/Host-Namensnachweis muss erst entwickelt und getestet werden.
2. **LAN-Signaling ohne TLS:** Bei lokalen `ws://`-Servern können Signaling-Metadaten im ungeschützten Netzwerk beobachtet werden. Nutzung nur in vertrauenswürdigen Netzen oder geeigneter gesicherter Infrastruktur.
3. **Echte Windows- und Hardwareleistung:** Einheitstests belegen nicht, dass Mikrofon, 1440p60, beide gleichzeitigen Streams oder Spielsound unter Netzwerklast einwandfrei funktionieren.
4. **Update-Vertrauensbasis:** Weder Publisher-Zertifikat noch reproduzierbarer signierter Upgrade-Test aus einer installierten Altversion liegen vor. Bestehende Schlüssel und `de.voxrally.desktop`/`voxrally://`-Kennungen ohne verifizierte Migration nicht verändern.
5. **Import-Fuzzing:** Vorab-Prüfungen reduzieren Dekompressionsrisiken, ersetzen aber keine Prüfung des eigentlichen OS-Decoders auf fehlerhafte oder mutierte Dateien.
6. **Dependency-Scan:** Laufzeit-Abhängigkeiten sind ohne bekannte High/Critical-Meldungen; Entwicklungstools und neu entstehende Advisories müssen getrennt überwacht werden.

## Ausstehende Schritte nach Masterprompt

- Testmatrix `docs/HARDWARE_ACCEPTANCE.md` auf zwei echten Windows-Rechnern absolvieren.
- Kritische Peer-Authentifizierung, unerwartete Verbindungsabbrüche und sichere Wiederherstellung unabhängig prüfen.
- Signierte Updatekette und Datenerhalt bei realer Installation testen; erst danach Freigabe erfragen.
- Abschließendes Audit mit hohem Denkaufwand und erneuter Regression **nach** der Hardwareabnahme.

## Historischer Befund

Die ursprüngliche Prüfung vom 11.11.2026 meldete ein moderates minimatch-Advisory (GHSA-g3hv-75wg-m249) bei einem Entwicklungswerkzeug; dieser Befund ist **nicht** gleichbedeutend mit einem aktuell bekannten kritischen Laufzeitfehler. Der aktuelle Runtime-Audit vom 16.11.2026 hat keine bekannten Sicherheitslücken gemeldet. Ältere Aussagen „automatischer Updater nicht implementiert“ sind überholt: Der zentrale Updater existiert, ist aber aus Sicherheitsgründen nicht produktiv aktiviert.

## Ergänzung 16.11.2026: Upgrade-, Geräte- und Entwicklungsabhängigkeitssicherheit

- `src/main.tsx`: Sitzungsepoche verhindert, dass verspätete getUserMedia-/getDisplayMedia-Freigaben nach Raumverlassen zu einem Medienleck führen. UI-Mikrofonberechtigungs- und Windows-Schlaf-/Resume-Test sind noch ausstehend.
- `desktop/main.cjs`: `pendingCapture` wird bei Disconnect entfernt; zuvor gehostete lokale WebSocket-Server werden bei Raumwechsel geschlossen.
- `desktop/migrations.cjs`: Atomare Version-2-Migration mit Schema-/Spaltenvalidierung vor Commit; unbekannt höhere Versionen werden nicht rückwirkend überschrieben.
- Releasevorbereitung: Programmversion im Draft-Branch `0.4.0`; keine Signatur- oder Vertrauensumgehung, `main`/installierte Version unverändert.
- CI erweitert um `pnpm audit --audit-level high` **einschließlich Build-/Dev-Abhängigkeiten**. Beim früheren Lauf 43849225448 wurden zwei Moderate in Dev-Abhängigkeiten gemeldet. Da der Schwellwert High ist, bleibt der Test bei ausbleibenden High/Critical rot nicht; es darf aber nicht behauptet werden, die gesamte Abhängigkeitsliste habe keine Advisories.
- Neues Restrisiko: Version 2 wurde bislang nur gegen synthetische und simulierte alte SQLite-Datenbanken geprüft. Eine Sicherung und echte Migration einer existierenden Windows-0.3.2-Installation bleiben zwingend vor Freigabe.
