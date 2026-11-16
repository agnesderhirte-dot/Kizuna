# AKTUELLSTE ERGÄNZUNG – 0.4.0 als In-App-Update statt Neuinstallation

Der Nutzer möchte **ausschließlich eine Aktualisierung der bestehenden KIZUNA-Installation**, keine manuell gestartete neue EXE. Diese Vorgabe überlagert ältere Windows-Installer-Testhinweise.

- P2P-Updater der installierten 0.3.2 ist vorhanden. Der Ed25519-Public-Key in `main` und in 0.4.0 ist identisch.
- Der neue lokale Helper `scripts/prepare-peer-update.cjs` prüft Installer gegen `.sha256`, signiert die Update-Metadaten mit **dem ursprünglichen privaten Key** `build/private/update-key.pem`, prüft die Signatur gegen den eingebetteten Public-Key und gibt eine lokale `.exe.update.json` aus. Niemals Schlüsselmaterial hochladen oder den alten vertrauenswürdigen Schlüssel ersetzen.
- Ein bereits installierter 0.3.2-Client kann ein **signiertes** Update einem verbundenen Peer anbieten und von ihm empfangen. Empfänger startet die Installation erst nach erfolgreichem Hash-/Signaturnachweis und bewusstem Installationsklick bei beendetem Raum.
- Der zentrale GitHub-Updater bleibt deaktiviert; ein GitHub-Artefakt allein aktualisiert den vorhandenen Client nicht. Fehlt der alte private Schlüssel oder ein zweiter Peer, ist dieser In-App-Weg noch **blockiert**.
- [Vollständige Ablaufbeschreibung](docs/IN_APP_UPDATE.md). Keine manuelle EXE-Neuinstallation als erfülltes Nutzerziel ausgeben. Keine Änderung an `main`, kein Merge/Release.

---

# AKTUELLSTE ÜBERGABE – zusätzlicher GitHub-Durchlauf, 16.11.2026

Diese Kurzfassung ist aktueller als die historischen Abschnitte darunter.

- Entwicklungsbranch `feat/retro-modern-skins`, Draft-PR #1, vorbereitete Version **0.4.0**. Keine Änderung von `main` oder laufenden Windows-Installationen.
- **Ergebnis vor den abschließenden Dokumentationscommits:** GitHub CI [43853358827](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43853358827) prüfte den Funktionscode mit **119 bestandenen Tests, 0 Fehlern**; Build und Runtime-/Dev-Dependency-High-Audit grün. Windows-Paket-Smoketest [43853358803](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43853358803) ebenfalls erfolgreich. Für den finalen Commit unterhalb **immer GitHub-Actions-SHA erneut vergleichen**.
- Neu: `src/updates.ts` verhindert raumübergreifende Updateangebote und verspätete Update-Aktionen. Nur vollständig geprüfte Installer bleiben nach Room-Exit für späteren manuellen Installationsklick vorhanden.
- Neu: `desktop/migrations.cjs` legt **vor** SQLite-v1→v2-Migration ein einmaliges, überprüftes SQLite-V1-Backup durch `VACUUM INTO` an (`voxrally.sqlite.pre-0.4.0-backup`, privates UserData-Verzeichnis). Verunreinigte Backups blockieren das Upgrade; nicht automatisch löschen/überschreiben. `tests/migrations.test.cjs` prüft Snapshot, v1-Inhalt und Rollback.
- Sicherheitsprüfung exakt: zwei moderate **Dev-Abhängigkeit**-Warnungen zu `minimatch` aus `electron-builder`, Advisory `GHSA-g3hv-75wg-m249`. Kein Runtime-Advisory gefunden. Major-11-Override ohne getestete NSIS-/Windows-Kompatibilität unterlassen.
- Windows-Bausteine weiterhin ausstehend: manuelle Datenrücksicherung aus dem V1-Snapshot, echte Zwei-PC-Audio-/1440p60-Latenztests, signierter Publisher-Release, Tests der installierten Updatestrecke. Kein Merge, keine Freigabe, keine EXE an andere Nutzer.
- Weitere Einzelheiten: `docs/MASTER_ROADMAP.md`, `docs/WINDOWS_HANDOFF.md`, `docs/SECURITY_AUDIT.md`.

---

# AKTUELLSTE ÜBERGABE – 16.11.2026 / bis zur Windows-/Codex-Phase

Die folgende Sektion ist der **aktuellste** verbindliche Stand; ältere Bereiche weiter unten sind historische Übergaben.

## Projekt und Release-Schutz
- Repository: https://github.com/agnesderhirte-dot/Kizuna
- Branch `feat/retro-modern-skins`, [Draft-PR #1](https://github.com/agnesderhirte-dot/Kizuna/pull/1), kein Merge nach `main`.
- Ausgelieferte/alte Basis 0.3.2; im Branch ist **0.4.0** als nächstes **unveröffentlichtes** Feature-Release vorbereitet. Alte App-ID `de.voxrally.desktop`, `voxrally://`, EXE-Name `VoxRally` und `%APPDATA%\\VoxRally` bleiben gleich. Kein Installer erstellt, keine Signatur gewechselt, keine Endnutzer aktualisiert.
- Zentrale Updates sind mangels Publisher-Codesignatur weiterhin deaktiviert. P2P-Updatefunktion hält ihren bestehenden Ed25519-Public-Key; keine signaturlose Abkürzung.
- Das aktuelle CI-Ergebnis muss stets für die aktuelle PR-Head-SHA geprüft werden; frühere Testergebnisse nicht auf neue Commits übertragen.

## Letzte direkt über GitHub erledigte Aufgaben
- KZ-021: verspätete `getUserMedia`-/`getDisplayMedia`-Freigaben über `sessionEpoch` nach Room-Exit verwerfen und Tracks stoppen.
- KZ-022: transaktionale SQLite-Migration v1→v2 mit Validierung von Tabellen/Spalten, Rollback und Erhalt von Einstellungen, Chat und Assets.
- KZ-023: lokale WebSocket-Signaling-Server bei Room-Exit/-Wechsel zuverlässig schließen, Capture-Tickets verwerfen.
- KZ-024: GitHub CI prüft TypeScript/Vite/Node-Tests und High/Critical-Advisories für Produktions- **und** Entwicklungsabhängigkeiten. Zwei Moderate im Dev-Scope wurden bei Run 43849225448 gemeldet, keine High/Critical.
- UI-Korrekturen: eigenes Profilfoto in der Sidebar, Spielkalender mit korrekter Überschrift.
- Nutzwertanalyse Nitro-Funktionen in `docs/NITRO_FEATURE_REVIEW.md`; Zusatzfeatures mit unnötigem Bandbreiten-/GPU-/Speicherbedarf bewusst zurückgestellt.
- Weiter vorhanden: Skins, Sprecherrahmen, 1440p30/60-Presets, Voice-/Game-Audio-Mixer, Soundboard, Emoji-Reaktionen, Profile, Kalender und 36 Fußballweisheiten.

## Nächster verpflichtender Schritt
- **`docs/WINDOWS_HANDOFF.md`** enthält einen vollständigen Codex-Arbeitsauftrag, Tests, Sicherung der alten Nutzerdateien, Zwei-PC-Latenz-/Bild-/Tontests, 1440p60-Benchmark und Release-Gates.
- **`docs/HARDWARE_ACCEPTANCE.md`** ist die systematische Abnahmecheckliste; `docs/SECURITY_AUDIT.md` listet offene Risiken.
- Realer Test auf dem Windows-PC notwendig: Mikrofon, System-/Spielaudio, Netzwerkabbruch und RAM/CPU/GPU mit zwei realen 1440p60-Streams, Upgrade aus installierter 0.3.2, Windows-Codesignatur und Nutzereinwilligung.
- Automatische externe E-Mail-/WhatsApp-Zustellung benötigt einen autorisierten Provider, Einwilligung und gegebenenfalls eigene Gebühren.
- Kein unabhängiger Pentest und keine echte langlaufende Windows-Abnahme erfolgt; diese nicht als erledigt bezeichnen.

---

# AKTUELLSTE ÜBERGABE – 16.11.2026 / KZ-020 und KZ-014

Diese Kopfsektion ist aktueller als alle nachfolgenden historischen Statusangaben.

- Projekt: https://github.com/agnesderhirte-dot/Kizuna, Entwicklungsbranch `feat/retro-modern-skins`, Draft-PR #1, kein Merge.
- **Neue Startfunktion KZ-020:** 36 kurze eigene Fußballweisheiten, je ein Spruch pro App-Start, letzter numerischer Index nur lokal gespeichert (`localStorage`), keine unmittelbare Wiederholung. Schließbar, skinfarbener Banner unter Haupttitel, Ausblendung beim erfolgreichen Raumeintritt. Implementierung `src/FootballWisdom.ts`, `src/main.tsx`, `src/style.css`; Tests `tests/football-wisdom.test.cjs`.
- **KZ-014 Codeoptimierungen:** `src/MediaActivityGate.ts` verhindert redundante IPC-Meldungen aktiver Medien; `src/SoundPlaybackPool.ts` gibt Audio und Blob-URLs bei Ende/Stop/Fehler/Room-Exit frei; Audio-Sink wird bei Lautstärkeregelung nicht ständig neu initialisiert. Asynchroner Hintergrundbildwechsel akzeptiert nur gültige aktuelle Ergebnisse.
- **Geprüfter Programmstand:** Commit `f11ca1abaa9cbbce563ef462d965abb27c55ebba` [GitHub Actions Run 43835700399](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43835700399): TypeScript/Vite-Build erfolgreich, **83 Tests bestanden / 0 Fehler / 1 übersprungen**, Runtime-Dependency-Audit ohne gemeldete High/Critical-Advisories. Danach wurden dokumentierende Commits erstellt; letzten CI-Run prüfen.
- **Offen:** echte Windows-UI, CPU/GPU-/Netzwerkmessung, Audio-Ende-zu-Ende-Latenz auf zwei PCs, stabile 1440p60-Leistung unter Last, unabhängige finale KZ-014-Prüfung und signierte Updateveröffentlichung. Die installierte App und `main` sind weiterhin unverändert. Keine Nutzeraktualisierung veranlassen, solange keine Releasefreigabe vorliegt.
- Details: `docs/MASTER_ROADMAP.md`, `docs/DEVELOPMENT_PROGRESS.md`, `docs/HARDWARE_ACCEPTANCE.md`.

---

# AKTUELLSTE ÜBERGABE – 16.11.2026 / Megaprompt KZ-013 & KZ-014

- Entwicklungsbranch `feat/retro-modern-skins`, Draft-PR https://github.com/agnesderhirte-dot/Kizuna/pull/1, `main` unverändert.
- **Geprüfter Quellstand:** `f61ec2a953ab41fc6c40ef0187ce9f642e0047d3`, [CI-Run 43828763644](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43828763644): Build grün, **74 Tests erfolgreich, 0 fehlgeschlagen, 1 übersprungen**; `pnpm audit --prod --audit-level high` erfolgreich, keine bekannten Runtime-Lücken.
- **Neu:** WebRTC-ICE-Schema-/Längenprüfung, Schutz vor doppelten DataChannels, Peer-Sound-ACK-Cache-Limits, Audio-/Stream-/Timer-Cleanup, Cloud-Signaling-Queue-/Rate-Limits, Bild-Dimensionen vor nativer Dekodierung.
- **Dateien:** `src/mesh.ts`, `src/cloud.ts`, `desktop/image-limits.cjs`, `desktop/main.cjs`, `tests/mesh-hardening.test.cjs`, `tests/signaling-hardening.test.cjs`, `tests/image-limits.test.cjs`, `.github/workflows/validate.yml`.
- **Vorläufiges Audit:** `docs/SECURITY_AUDIT.md`. Roadmap `docs/MASTER_ROADMAP.md` (KZ-013/014/019), Testmatrix `docs/HARDWARE_ACCEPTANCE.md`.
- **Offen:** unabhängige KZ-014-Endprüfung, reale Windows- und Zwei-PC-/Audio-/1440p60-Dauertests, Signatur und geprüfter zentraler Updater. **Keine Releasefreigabe**; keine installierte Software verändert.
- Nach Dokumentationscommits jeweils neuesten CI-SHA prüfen; vorherige Testbelege nicht automatisch auf neue Programmänderungen übertragen.

---

# AKTUELLSTE ÜBERGABE – 16.11.2026, KZ-016–018

Diese Hinweise überschreiben die älteren Statusangaben weiter unten; die alten Angaben sind nur noch historische Momentaufnahmen.

- Branch: `feat/retro-modern-skins`; Draft-PR https://github.com/agnesderhirte-dot/Kizuna/pull/1; `main` und installierte Windows-Version nicht verändert.
- **Neu im Branch:** Teilnehmerbezogene Sprachausgabe (individueller Pegel und Stumm), pro Peer lokale Unterdrückung von Reaktionen und Soundboard-Clips. Die Person sendet weiterhin ungestört, der Empfänger kontrolliert nur sein eigenes Wiedergabemischpult. `src/ParticipantAudio.tsx`, `src/audio-mix.ts`, `src/main.tsx`, `src/mesh.ts`.
- **Diagnosebericht:** `src/diagnostic-report.ts` und validierte `copyDiagnostics`-IPC. Nur manuelles Kopieren, kein automatischer Upload. Kann Teilnehmernamen enthalten; vor Weitergabe prüfen.
- **QualityAdvisor:** `src/QualityAdvisor.ts` und erweiterte `src/QualityDiagnostics.ts` zeigen vorsichtige Hinweise erst nach 3 aufeinanderfolgenden hohen Audio-/Videopaketverlust-, Audiopuffer- oder RTT-Werten. Kein bloßer FPS-Alarm für statische Bilder und keine automatische Netzwerkeinstellung.
- **Sound löschen:** `deleteSound`-IPC mit validierter SHA-256-ID, nur `kind==='sound'`, zweistufige UI-Bestätigung. Andere Assets bleiben unangetastet.
- **CI-Nachweis Code:** GitHub Actions https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43825148728: `pnpm build` erfolgreich, `pnpm test` **66 bestanden, 0 fehlgeschlagen, 1 übersprungen**. Spätere Dokumentations-/Hinweistext-Commits sind anhand des letzten CI-Runs noch zu prüfen.
- **Noch offen:** echte Windows- und Zwei-PC-Tests, 1440p60 unter realer Last, End-to-End-Tonlatenz, abschließendes Security- und Performanceaudit, signierter zentraler Update-Release und ausdrückliche Freigabe. Kein Installer/Update ausgeliefert.
- Master-Roadmap: `docs/MASTER_ROADMAP.md`; Testmatrix: `docs/HARDWARE_ACCEPTANCE.md`; Entwicklungsverlauf: `docs/DEVELOPMENT_PROGRESS.md`.

---

# AKTUELLER HANDOFF – 16.11.2026 (ohne Codex-Sitzung)

Diese Kopfsektion ist der **neueste Stand**. Ältere Übergaben weiter unten sind historische Momentaufnahmen und dürfen nicht unkritisch als aktueller Status übernommen werden.

## Projekt
- Repo: https://github.com/agnesderhirte-dot/Kizuna
- Entwicklungsbranch: `feat/retro-modern-skins`
- Draft-Pull-Request: https://github.com/agnesderhirte-dot/Kizuna/pull/1
- Ausgangsversion: 0.3.2 in `main`; **kein Merge, keine EXE, kein Update an Nutzer veröffentlicht**.
- Letzter sicher vollständig geprüfter Stand vor aktualisiertem CI-Workflow: GitHub Actions https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43821435998, erfolgreich. Für jeden neueren Commit neuesten CI-Lauf prüfen; Dokumentations-/Workflow-Änderungen wurden ebenfalls gepusht.
- `pnpm build` und `pnpm test`: zuletzt 51 Tests erfolgreich, 0 fehlgeschlagen, 1 übersprungen. Dieser Stand ist kein realer Zwei-PC-Test.

## Neu implementiert, vom GitHub-CI-Build gedeckt
- Skins (9) und Fokusmodus, aktive Sprecherrahmen mit Pegelheuristik, Sync-Fußball-Reaktionen, Suchfeld und Favoriten.
- Separate Spielsound-Stummschaltung je fremdem Bildschirm, Sprach-/Soundboard-Ton davon unabhängig. Sichtbarer Bildstream und sein Spielton werden über dasselbe HTMLMediaElement wiedergegeben; Soundboard-Dateien pro Peer cachebar.
- Audio/Video-Diagnose (FSP/Bitrate/RTT/Jitter/Paketverlust/Audiopuffer/kaschierte Samples), Mikrofon-Selbsttest mit rein lokaler 3-Sekunden-Aufnahme, 1440p30/60- und 1080p30-Presets.
- Profile mit lokal auf 96 × 96 Pixel komprimierter Avatar-Datei (nur JPEG), Bio und Lieblingsspiel. Peer-Profiltransfer ist auf eng begrenzte Datenfelder und Bilder beschränkt; Bearbeitungsentwürfe werden erst nach Speichern publiziert.
- Spielkalender mit SQLite-Terminen, wöchentlicher Wiederholung, Monatsliste, Windows-Erinnerungen **nur solange Kizuna läuft**, ICS-Export und lokaler Berliner Sommer-/Winterzeit, Kopieren/Teilen in der Lounge sowie ausdrücklich **manuell versendeten** WhatsApp- und E-Mail-Einladungen.
- Drei eigene synthetische Signal-Sounds: Tor-Signal, Anpfiff, künstlicher Applaus. Keine fremden Aufnahmen oder ungeprüft lizenzierten Sounds eingebaut.
- Zentraler Updater zeigt Changelog nach sicherer Aktivierung. Releasekanal weiterhin deaktiviert und signaturabhängig.
- GitHub-Workflow bremst unnötige parallele CI-Aufträge durch `concurrency.cancel-in-progress`.

## Besonders relevante Dateien
- `src/GameCalendar.tsx`, `desktop/calendar.cjs`: lokale Terminplanung + Erinnerungen + ICS.
- `src/ProfilePanel.tsx`, `src/mesh.ts`, `src/main.tsx`: Profile und Peer-Broadcast.
- `src/reactions.ts`, `src/ReactionPicker.tsx`: erweiterte Unicode-Reaktionsbibliothek.
- `desktop/bundled-sounds.cjs`: reproduzierbare Originaleffekte.
- `desktop/central-updater.cjs`: begrenzte Release-Informationen mit Einwilligungsdialog.
- `docs/MASTER_ROADMAP.md`: priorisierte Gesamtcheckliste und empfohlene GPT-Denkstufe für jedes Arbeitspaket.
- `docs/DEVELOPMENT_PROGRESS.md`: vollständige chronologische Entwicklung.
- `docs/HARDWARE_ACCEPTANCE.md`: echte Windows-/Zwei-PC-Abnahme.
- `docs/SOUND_SOURCES.md`: Rechte- und Soundquellennachweis.

## Noch nicht abgeschlossen – durch weiteren Textcode nicht seriös belegbar
1. Echte Windows-Zwei-PC-Hardwaretests, 1440p60-Qualitätsmessungen, Sprach- und Ende-zu-Ende-Audiolatenz über verschiedene Netze.
2. Zusätzliche freie externe Musik/Fangesänge nur nach Herkunfts-/Lizenzprüfung. Bisher ausschließlich eigene synthetische Sounds.
3. Automatische E-Mail-/WhatsApp-Zustellung ohne laufendes Programm benötigt einen autorisierten Versandweg, Konfiguration, explizites Opt-in und ggf. Kostenfreigabe.
4. Signierte zentrale App-Releases und verifizierte Auto-Updates fehlen wegen Herausgeber-/Codesignatur-/Releasekonfiguration. Bestehende Integritätssicherungen nicht umgehen.
5. Unabhängiges Abschlussaudit, Windows-GUI, Long-Run und Nutzerfreigabe für die Veröffentlichung.

## Unveränderliche Sicherheitsregeln
- App-ID `de.voxrally.desktop`, `voxrally://`, lokaler Datenordner `VoxRally` und vorhandene Signaturschlüssel beibehalten, solange Migration nicht getestet.
- Kein eigenmächtiger Merge nach `main`, keine ungesicherten Updates oder echten Nachrichten an Freunde.
- Gute Unit-Tests ≠ produktionsreife App; fehlende Hardware-/Leistungsbeweise deutlich kennzeichnen.
- Keine falschen Werbeaussagen wie „ruckelfreie 1440p60 garantiert“ oder „WhatsApp automatisch“.

---

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
