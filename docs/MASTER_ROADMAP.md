# KIZUNA – verbindliche Entwicklungsroadmap

Stand: 2026-11-16. Referenz: `main` / KIZUNA 0.3.2, vorbereitete 0.4.0 im Entwicklungsbranch `feat/retro-modern-skins`, Draft-PR #1. **Keine produktive Veröffentlichung ohne Benutzerfreigabe.**

## Statusregeln
- [ ] Offen: kein Code oder nur Konzept.
- [~] In Arbeit: Code wird erarbeitet, Tests noch unvollständig.
- [x] Implementiert: Dateien im Entwicklungsbranch, aber noch nicht automatisch abgenommen.
- [T] Getestet: konkrete Tests protokolliert; reale Zwei-PC-Prüfung getrennt.
- [F] Freigegeben: ausdrücklich für Release genehmigt und nachweislich veröffentlicht.

## Aufgaben mit messbaren Akzeptanzkriterien

| ID | Priorität | Aufgabe | Modell-Empfehlung | Status | Akzeptanz und Blocker |
|---|---|---|---|---|---|
| KZ-001 | P0 | Bestandsaufnahme, Test-Baseline, Sicherheits-/Medienrisiken | GPT-6 High | CI-Baseline vorhanden; Hardware-Audit offen | Code-/Testinventar, Build und Baseline-Messwerte; echte Zwei-PC-Abnahme offen |
| KZ-002 | P1 | Neun Skins und Skin-Galerie inklusive Fokusmodus | GPT-6 Medium, Review High | CI getestet; Windows-GUI offen | TypeScript/GUI/Regression, Skinwechsel im Stream, Datenerhalt |
| KZ-003 | P1 | Sprecherumrandung (Mikrofon statt Spielaudio) | GPT-6 High | CI getestet; reale Mikrofone offen | Lokal/remote korrekt sichtbar, Timeout, Mute, Vollbild, Tests, begrenzter CPU- und Signaling-Overhead |
| KZ-004 | P1 | Synchrone Fußball- und Standardreaktionen | GPT-6 Medium | CI inklusive Favoriten und erweiterter Emoji-Bibliothek; GUI offen | Whitelist, Peer-Ratenlimit, visuelle Overlays, Vollbild, Blockierbarkeit |
| KZ-005 | P0 | Schlechter Ton: Messung + Geräte-, Opus- und Loopback-Diagnose | GPT-6 High | Diagnose/Playback-Fixes CI getestet; Hörtest offen | Reale Hörtests sowie Jitter/Verlust/Latenz dokumentiert |
| KZ-006 | P0 | 1440p60: Capture/Encoder/Netzwerkprofile benchmarken | GPT-6 Extra High | Messanzeigen und Presets CI-getestet; reale 1440p60-Abnahme offen | Soll-/Ist-FPS, Bitrate, RTT, Drops, CPU/GPU auf zwei PCs; keine unbelegte FPS-Garantie |
| KZ-007 | P1 | Soundboard: eigene Tracks und legal lizenzierte freie Effekte | GPT-6 Medium/High | Eigene Import-Sounds und drei Originaleffekte CI-getestet; Drittmaterial nicht gebündelt | Dateiformate, Lautheit, Rechte/Lizenzprotokoll, Empfänger-Test |
| KZ-008 | P2 | Benutzerprofile mit Profilbild, Banner, Teilen und Datenschutz | GPT-6 Medium | Profil/Avatar P2P und Speicherung CI-getestet; Zwei-PC-GUI offen | Dateiprüfung, Größenlimit, Thumbnail, Remote-Darstellung, Persistenz |
| KZ-009 | P2 | Komfortfunktionen nach Nitro-Nutzwertprüfung | GPT-6 Medium | Nutzwertprüfung dokumentiert; selektierte Features CI-getestet, übrige bewusst zurückgestellt | Sinnvolle Funktionen statt blindem Nachbau; Tests pro Feature |
| KZ-010 | P2 | Spielkalender, Wiederholung, lokale Windows-Erinnerungen | GPT-6 Medium | Kalender/ICS/lokale Erinnerungen CI-getestet; Windows-Abnahme offen | ICS, Zeitzonen, Zustellung und Datenerhalt |
| KZ-011 | P3 | Optionale E-Mail-/WhatsApp-Erinnerungen | GPT-6 High | Manuelles Teilen umgesetzt; automatischer Versand mangels Provider/Opt-in offen | Opt-in, verifizierter Versandweg, WhatsApp nur offiziell; ggf. Kostenfreigabe |
| KZ-012 | P0 | Zentraler Updateservice + signierter Upgradepfad | GPT-6 Extra High | Zielversion 0.4.0 und SQLite-Migration v2 getestet; Publisher-Signatur und realer Upgrade-Test blockieren Freigabe | Kein unsigniertes Vertrauen; echter installierter Versionswechsel, aktiven Stream schonen |
| KZ-013 | P0 | Sicherheit, Netzwerk- und Langzeittests | GPT-6 High | Stale-Capture- und LAN-Teardown-Fixes CI-geprüft; Zwei-PC-/Langzeittests offen | Zwei reale PCs, getrennte Netze, 1h/4h Soak, Wiederverbindung |
| KZ-014 | P0 | Abschließendes Architektur-/Performance-Audit | GPT-6 Extra High | Infrastruktur-/Nutzwert- und Migrationsaudit verbessert; unabhängige Windows-Schlussprüfung offen | Zweites Review, konkrete Messwerte, offene Restrisiken |
| KZ-015 | P0 | Spielsound pro Teilnehmer separat stummschalten und Audio-Video-Synchronität verbessern | GPT-6 High | CI getestet; Zwei-PC-Latenztest offen | Sprecher und Soundboard bleiben hörbar; Bild/Spielsound in einem Stream-Element; Sound-Cache, Empfänger-ACK und Verzögerungsmessung |
| KZ-016 | P1 | Einzelne Stimmen, Reaktionen und Soundboard-Beiträge je Mitspieler lokal regeln | GPT-6 Medium | CI getestet; Windows-Zwei-PC-Abnahme offen | Receiver-only-Mix, keine Track-Änderungen, P2P-Sender-ID für Sound, Opt-out ohne Störung der Streams |
| KZ-017 | P1 | Diagnose kopieren und bei dauerhaftem Verlust/Jitter beraten | GPT-6 High | CI getestet; reale Messwertkalibrierung offen | Begrenzter und bewusst geteilter Bericht, keine Zugangsdaten, Warnungen erst nach 3 auffälligen Intervallen |
| KZ-018 | P2 | Eigene Soundbibliothek mit sicherer Löschung verwalten | GPT-6 Medium | CI getestet; GUI-Abnahme offen | Hash-ID, Sound-only-Löschung, zwei Klicks, andere Assets unangetastet |
| KZ-019 | P0 | Rasterbild-Dekodierung vorab auf Bildgröße/Pixelbudget prüfen | GPT-6 High | Automatisiert getestet; Decoder-Fuzzing offen | PNG/JPEG/GIF/WebP-Header, Avatar 8MP, andere Bilder 16MP, keine unbeschränkte native Dekodierung |
| KZ-020 | P2 | Bei jedem Kizuna-Start eine Fußballweisheit anzeigen | GPT-6 Medium, Review High | CI-getestet; Windows-Optik offen | 36 eigene Offline-Sprüche, kein direkter Wiederholer zwischen Programmstarts, skinfarben, schließbar, beim Raumeintritt weg |
| KZ-021 | P0 | Medienfreigaben nach Raumwechsel/Verlassen abbrechen | GPT-6 High | CI-getestet; Windows-Berechtigungsdialog noch real zu testen | Epoch-/Raumprüfung vor Aktivierung, verspätete Streams stoppen |
| KZ-022 | P0 | Bestehende Nutzerdaten beim Upgrade transaktional migrieren | GPT-6 Extra High | SQLite-v1→v2-Tests bestanden; installierter Windows-Upgrade noch ausstehend | Keine rückwirkende Versionsüberschreibung, Schema-/Spaltenprüfung, Rollback |
| KZ-023 | P1 | Ungenutzte LAN-Signaling-Server bei Raumwechsel schließen | GPT-6 High | Unit-/Integrationstest; Windows-Portfreigabe offen | Listener schließen, Capture-Ticket verwerfen |
| KZ-024 | P1 | Runtime- und Dev-Dependency-Audit und Release-Gates | GPT-6 High | CI-Test erfolgreich; zwei moderate Dev-Advisories dokumentieren | Kein blindes Updating, keine bekannte High/Critical-Advisory, signierter Release weiterhin erforderlich |
| KZ-025 | P0 | V1-Datenbank automatisch und konsistent vor Migration sichern | GPT-6 High | CI-Tests erstellt; reale Windows-Datenprobe ausstehend | VACUUM INTO-Snapshot mit Integritäts-/Versionsprüfung, beschädigte Backups blockieren Upgrade |
| KZ-026 | P0 | Updatefreigaben und asynchrone Updateaktionen an den Raum binden | GPT-6 High | CI-getestet; Windows-Update-Abnahme ausstehend | Keine unbeabsichtigte Veröffentlichung von Updates aus alten Räumen; bereits geprüfte Installer bleiben bereit |

## Arbeitsreihenfolge
1. Baseline und PR #1 auf technische Probleme prüfen, einschließlich sicherem gespeicherten Fortschritt.
2. Sprecherumrandung und synchronisierte Reaktionen als isolierte, leichte Datenkanal-Funktionen.
3. Audio-Ursachenanalyse und Qualitätstests; keine blinde DSP-Erweiterung.
4. 1440p60-Profil und Leistungsoptimierung durch Vergleichsmessungen.
5. Skins/Profil/Soundboard/Kalender nach Abhängigkeiten integrieren.
6. Zentralen Updateservice nach Signatur- und Windows-Abnahme aktivieren.
7. Endaudit, Freigabe, Releases und nutzerseitige Updatehinweise.

## Release-Regeln
Keine Änderung ungefragt nach `main` mergen. Kein Update an andere Nutzer pushen, ohne Nutzereinwilligung, Windows-Codesignatur und gültige Signaturkette. Alte `voxrally://`-Kennungen und `de.voxrally.desktop` sowie vorhandene Schlüssel bis zu einer geprüften Migration erhalten. Die vorhandene P2P-Updatefunktion erhalten. Tests und Build nicht als bestanden markieren, bevor sie ausgeführt wurden.

### Nachweisstand 16.11.2026
GitHub Actions `validate`, Run **43775020122** (`4a57166b0a3a62af7a028f7bf00b1775dcb99469`): `pnpm build` erfolgreich, `pnpm test` **24 bestanden / 0 fehlgeschlagen / 1 übersprungen**. Das ist **keine Windows-/Mikrofon-/Zwei-PC-Abnahme**. Nachfolge-Commits an Dokumentation sind unveränderte Quelllogik, müssen aber auf ihren eigenen CI-Status geprüft werden.

### CI und Audio-Fortschritt – 16.11.2026
- Branch `feat/retro-modern-skins` enthält getrennte Stummschaltung pro fremdem Bildschirm, synchrone Wiedergabe von Bildschirm und Systemaudio im selben HTMLMediaElement, Audio-only-Fallback für gerade nicht sichtbare Streams sowie entkoppelte Voice- und Soundboard-Wiedergabe.
- Soundboard mit SHA-256-Cache, Empfängerbestätigung und Start in 160 ms nach Bereitschaft für unterstützte Clients; keine künstliche Wartezeit von 600+300 ms mehr. Erstmalige Dateiübertragung benötigt weiterhin Zeit. Kompatibilitäts-Fallback für alte Clients verbleibt.
- Audiostatistiken einschließlich Jitter, paketverlustbasierter Kennzahlen, Audio-Playout-Puffer und kaschierter Samples; keine Garantie auf dauerhaft niedrige Latenz.
- GitHub Actions Run [43817017128](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43817017128): `pnpm build` bestanden, `pnpm test` 35 insgesamt, **34 bestanden, 0 fehlgeschlagen, 1 übersprungen** (SHA `f496c99084580b2fc7fcdc863bc19d86025b20db`). Reale Win10/11- und Zwei-PC-Latenzmessungen sind weiterhin offen.

### Fortschritt ohne Codex-Guthaben – 16.11.2026
Direkt über die GitHub-Verbindung erstellt: Profilverwaltung mit zugeschnittenen Fotos (96×96), P2P-Profiltransfer, lokaler Spielkalender mit Wiederholung und Windows-Erinnerungen bei geöffnetem Programm, ICS-Export mit Zeitzonenbehandlung, manuelle Einladungsweitergabe per E-Mail/WhatsApp, drei rein synthetische Original-Signaltöne, erweiterte Emoji-Auswahl mit persistenten Favoriten sowie Changelog-Texte für zukünftige signierte Updates.

Nachweis: GitHub Actions [Run 43820759138](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43820759138), **51 bestanden, 0 fehlgeschlagen, 1 übersprungen** (vor den nachfolgenden Emoji-/Dokumentationscommits). Die aktuellste Prüfung ist vor Release erneut zu kontrollieren.

**Weiterhin blockiert:** echte Sprach-/Video-/Netzwerkleistung auf zwei Windows-PCs, hochqualitatives 1440p60 unter Last, automatisches Senden ohne eingerichteten legalen Versanddienst, Drittlizenz-Soundbibliothek ohne geprüfte Quellen, produktiver zentraler Signatur-Release und manuelle Freigabe.

### Weiterentwicklung vom 16.11.2026 – direkter GitHub-Branch
- Neue lokale **Mitspieler-Steuerung** im Stream: Stimmen individuell von 0–100 % regeln, pro Mitspieler Reaktionen ausblenden und Soundboard-Beiträge stumm schalten. Nur empfangsseitige Darstellung/Wiedergabe, keine Änderungen am sendenden MediaStream.
- Neue **Verbindungsdiagnose** mit begrenztem Bericht zum manuellen Kopieren über vertrauenswürdigen Electron-IPC (keine automatische Übertragung). Hinweis: Der Bericht kann Teilnehmernamen enthalten; vor Weitergabe kontrollieren.
- **Passiver Qualitätsberater** bei wiederholt gemessenen Audio-/Videopaketverlusten, hohen Audiopuffern oder RTT. Empfehlungen erst ab drei auffälligen Messintervallen; geringe FPS bei statischer Football-Manager-Oberfläche allein gelten nicht als Fehler. Kein automatisches Verändern der Streamingparameter.
- **Soundbibliothek aufräumen:** Sound nach zweiter Bestätigung entfernen, nur hashvalidierte lokale Soundassets, Fotos und Hintergründe geschützt.
- Bestätigter GitHub Actions Lauf [43825148728](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43825148728): TypeScript/Vite-Build erfolgreich; **66 Tests bestanden, 0 fehlgeschlagen, 1 übersprungen**. Nachfolgende Text-/Datenschutzanpassungen erneut in der jeweils letzten CI prüfen.
- Realtests auf zwei Windows-PCs und sicherer Release bleiben weiterhin ausstehend.

### Fortschritt KZ-013 und Auditvorbereitung KZ-014 – 16.11.2026
- `src/mesh.ts`: Eingehende ICE-Kandidaten validieren, doppelte Nachrichten-/Updatekanäle abweisen, Sound-ACKs nur für angebotene Hashes akzeptieren (32 pro Peer), Audio-Timer/Streams/Dateicache beim Beenden aufräumen.
- `src/cloud.ts`: 2 MiB eingehende Signaling-Daten je 10 Sekunden und jeweils 512 KiB wartende In-/Outbound-Nachrichten als obere Grenze; Nachrichten ehemaliger Links verwerfen.
- `desktop/image-limits.cjs`: PNG/JPEG/GIF/WebP-Dimensionen vor nativer Dekodierung prüfen, um hochkomprimierte Pixelbomben abzuweisen.
- `.github/workflows/validate.yml`: `pnpm audit --prod --audit-level high` als weitere automatische Release-Hürde.
- **Erfolgreicher CI-Beleg:** [Run 43828763644](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43828763644) – `pnpm build` grün, **74 Tests bestanden / 0 Fehler / 1 übersprungen**, Produktionsabhängigkeits-Audit meldete keine bekannten Schwachstellen.
- Erste Audit-Dokumentation: `docs/SECURITY_AUDIT.md`. **Keine abgeschlossene KZ-014-Abnahme** ohne echte Windows-Hardware, Zwei-PC-Dauertests, Peer-Identitätsprüfung und signierte Upgrade-Tests.

### KZ-020 und weiterer KZ-014-Fortschritt – 16.11.2026
- **KZ-020:** 36 eigene, nicht zugeschriebene Fußballweisheiten in `src/FootballWisdom.ts`. Ein Spruch pro App-Start, lokale Speicherung nur des zuletzt verwendeten Index (keine unmittelbar aufeinanderfolgenden Wiederholungen), keine Internet- oder Musikrechte, skinfarbene Schließen-Schaltfläche; Hinweis verschwindet nach erfolgreichem Raumeintritt.
- **KZ-014 (technischer Teil):** `MediaActivityGate` sendet Medienstatus nur bei Änderung an Electron; `SoundPlaybackPool` räumt Blobs und Audioplayer nach natürlichem Ende, Fehler, Stop und Raumwechsel auf. Audio-Ausgabegeräte werden beim Ändern der Lautstärke nicht mehr erneut ausgewählt. Verspätete Hintergrundbild-Ladevorgänge dürfen nach dem Abwählen keinen Objekt-URL-Leak erzeugen.
- **Verifizierter Build:** [GitHub Actions Run 43835700399](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43835700399), Commit `f11ca1abaa9cbbce563ef462d965abb27c55ebba`, **83 Tests bestanden, 0 fehlgeschlagen, 1 übersprungen**, TypeScript-/Vite-Build und Audit produktiver Abhängigkeiten grün.
- **Offen:** Reale Messung von CPU/GPU, Browser-WebRTC-Buffering, zwei Windows-PCs, 1440p60 und Ende-zu-Ende-Audiolatenz. KZ-014 nicht zur Freigabe hochstufen; nur CI-Verhalten nachgewiesen.

### Zusätzliche rein per GitHub erledigte Arbeiten (16.11.2026)
- **KZ-021 Medien-Lifecycle**: späte Windows-Mikrofon-/Bildschirmfreigaben nach Raumwechsel oder Verlassen werden nicht aktiviert; Tracks sofort gestoppt, Stream-Ende nur für die aktuell aktive Freigabe wirksam.
- **KZ-022 Upgrade-Sicherheit**: `desktop/migrations.cjs` führt das SQLite-Schema künftig transaktional von Version 1 auf 2, prüft Tabellen und Spalten und führt bei Fehlern ein Rollback aus. Nutzerprofile, Einstellungen, Assets, Nachrichten und Kalender bleiben im Test erhalten. Alter `%APPDATA%\\VoxRally`-Pfad bleibt. Auf dem Branch ist die nächste Anwendungsversionsnummer **0.4.0** gesetzt – kein Installer veröffentlicht.
- **KZ-023 Signaling-Aufräumen**: Beim Raumwechsel oder Verlassen den lokalen WebSocket-Listener schließen und ausstehende Bildschirm-Capture-Tickets löschen.
- **KZ-024 Sicherheitsprüfungen**: GitHub Actions prüft jetzt Laufzeit- **und** Entwicklungs-Abhängigkeiten auf bekannte Advisories ab Severity High. Bei der Prüfung am 16.11.2026 keine High/Critical-Fehler; zwei Moderate in Entwicklungsabhängigkeiten gemeldet (nicht als 'null Schwachstellen' ausgeben).
- **KZ-009 Nitro-Nutzwertabgleich**: `docs/NITRO_FEATURE_REVIEW.md` dokumentiert, welche Komfortfunktionen sinnvoll sind und welche aus Bandbreiten-/Kosten-/Lizenzgründen bewusst entfallen.
- **Windows-Übergabe**: `docs/WINDOWS_HANDOFF.md` enthält konkrete Anweisungen für Codex, zwei PCs, Ton-/1440p60-Messung, Appdatenmigration, Signaturen, Versionierung und Releaseentscheidung.
- Der Entwicklungstand benötigt **kein Codex-Guthaben**, jedoch ChatGPT-/GitHub-Ressourcen. Die nächste sachliche Hürde ist die reale Windows-Abnahme: keine produktive Freigabe ohne unterschriebene/validierte Releasekette.

### Nachprüfung der GitHub-Arbeiten / 16.11.2026 (zweiter Durchlauf)
- Zwei transitive **moderate** Advisories konkretisiert: `minimatch@10.2.6` über `electron-builder > app-builder-lib > minimatch` sowie `minimatch@9.0.9` über `electron-builder > app-builder-lib > @electron/universal > minimatch`, Advisory [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Produktive Laufzeit-Abhängigkeiten nicht betroffen. Keine pauschale Major-11-Override ohne nachgewiesene electron-builder-Kompatibilität und realen Windows-Installer-Test.
- `src/updates.ts` (`KZ-026`) räumt signierte Raum-Updateangebote bei Raumwechsel ab; ausstehende Berechtigungs-/Dateiauswahlergebnisse aus alten Räumen werden ignoriert, Downloadfreigaben nach Raumwechsel abgebrochen. Der bereits **geprüfte** Installer bleibt für die manuelle Installation nach Raumverlassen erhalten.
- `desktop/migrations.cjs` (`KZ-025`): vor dem ersten Upgrade einer bestehenden v1-Datenbank SQLite-**VACUUM-INTO**-Snapshot im vorhandenen privaten UserData-Verzeichnis anlegen und auf Integrity + Version 1 prüfen. Beschädigte Backups verhindern die Migration statt Daten zu riskieren; Backup nicht automatisch überschreiben.
- Neue Tests: `tests/update-room-isolation.test.cjs` und Erweiterungen `tests/migrations.test.cjs`; Test-/CI-Stand zum neuesten Commit jeweils anhand Actions prüfen.

### KZ-012 Ergänzung – Gewünschter Updatepfad statt manueller Neuinstallation
- **Entscheidung des Nutzers:** Bestehende KIZUNA-Installation 0.3.2 per In-App-Update auf 0.4.0 bringen. Den Windows-Testinstaller **nicht** als direkte manuelle Installationsanleitung ausgeben.
- **Technisch vorhandener Weg:** 0.3.2 enthält den Ed25519-verifizierenden P2P-Updater. Der eingebettete öffentliche Schlüssel ist im 0.4.0-Branch unverändert. `scripts/prepare-peer-update.cjs` erzeugt ausschließlich auf dem lokalen PC aus einem GitHub-geprüften Paket und dem **bereits vorhandenen** privaten Key die passende `.update.json`-Signaturdatei. Fünf Unit-Tests für Prüfsumme, Schlüsselidentität und unveränderliches Manifest.
- **Blockiert bis lokaler Prüfung:** Existenz des ursprünglichen privaten Schlüssels `build/private/update-key.pem` und Verfügbarkeit eines zweiten KIZUNA-Peers. Ohne Key kein kompatibles, vertrauenswürdig signiertes Update; ohne Peer kein vorhandener Downloadkanal für die bereits installierte 0.3.2.
- **Nicht verwechseln:** Ein unsignierter Windows-Build aus GitHub ist *kein* freigegebenes In-App-Update. Der zentrale Updater in 0.3.2 ist deaktiviert. Details: `docs/IN_APP_UPDATE.md`.
