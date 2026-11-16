# KIZUNA – verbindliche Entwicklungsroadmap

Stand: 2026-11-16. Referenz: `main` / KIZUNA 0.3.2, Entwicklungsbranch `feat/retro-modern-skins`, Draft-PR #1. **Keine produktive Veröffentlichung ohne Benutzerfreigabe.**

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
| KZ-009 | P2 | Komfortfunktionen nach Nitro-Nutzwertprüfung | GPT-6 Medium | Teilweise umgesetzt (Skins, Profile, Emojis, Sounds); Nutzwertreview offen | Sinnvolle Funktionen statt blindem Nachbau; Tests pro Feature |
| KZ-010 | P2 | Spielkalender, Wiederholung, lokale Windows-Erinnerungen | GPT-6 Medium | Kalender/ICS/lokale Erinnerungen CI-getestet; Windows-Abnahme offen | ICS, Zeitzonen, Zustellung und Datenerhalt |
| KZ-011 | P3 | Optionale E-Mail-/WhatsApp-Erinnerungen | GPT-6 High | Manuelles Teilen umgesetzt; automatischer Versand mangels Provider/Opt-in offen | Opt-in, verifizierter Versandweg, WhatsApp nur offiziell; ggf. Kostenfreigabe |
| KZ-012 | P0 | Zentraler Updateservice + signierter Upgradepfad | GPT-6 Extra High | Update-Changelog vorbereitet; Signatur/Release weiterhin blockiert | Kein unsigniertes Vertrauen; echter installierter Versionswechsel, aktiven Stream schonen |
| KZ-013 | P0 | Sicherheit, Netzwerk- und Langzeittests | GPT-6 High | Quellcode/CI-Härtung geprüft; Zwei-PC-/Langzeittests offen | Zwei reale PCs, getrennte Netze, 1h/4h Soak, Wiederverbindung |
| KZ-014 | P0 | Abschließendes Architektur-/Performance-Audit | GPT-6 Extra High | IPC-/Audio-Speicheroptimierungen CI-getestet; unabhängige Schlussprüfung offen | Zweites Review, konkrete Messwerte, offene Restrisiken |
| KZ-015 | P0 | Spielsound pro Teilnehmer separat stummschalten und Audio-Video-Synchronität verbessern | GPT-6 High | CI getestet; Zwei-PC-Latenztest offen | Sprecher und Soundboard bleiben hörbar; Bild/Spielsound in einem Stream-Element; Sound-Cache, Empfänger-ACK und Verzögerungsmessung |
| KZ-016 | P1 | Einzelne Stimmen, Reaktionen und Soundboard-Beiträge je Mitspieler lokal regeln | GPT-6 Medium | CI getestet; Windows-Zwei-PC-Abnahme offen | Receiver-only-Mix, keine Track-Änderungen, P2P-Sender-ID für Sound, Opt-out ohne Störung der Streams |
| KZ-017 | P1 | Diagnose kopieren und bei dauerhaftem Verlust/Jitter beraten | GPT-6 High | CI getestet; reale Messwertkalibrierung offen | Begrenzter und bewusst geteilter Bericht, keine Zugangsdaten, Warnungen erst nach 3 auffälligen Intervallen |
| KZ-018 | P2 | Eigene Soundbibliothek mit sicherer Löschung verwalten | GPT-6 Medium | CI getestet; GUI-Abnahme offen | Hash-ID, Sound-only-Löschung, zwei Klicks, andere Assets unangetastet |
| KZ-019 | P0 | Rasterbild-Dekodierung vorab auf Bildgröße/Pixelbudget prüfen | GPT-6 High | Automatisiert getestet; Decoder-Fuzzing offen | PNG/JPEG/GIF/WebP-Header, Avatar 8MP, andere Bilder 16MP, keine unbeschränkte native Dekodierung |
| KZ-020 | P2 | Bei jedem Kizuna-Start eine Fußballweisheit anzeigen | GPT-6 Medium, Review High | CI-getestet; Windows-Optik offen | 36 eigene Offline-Sprüche, kein direkter Wiederholer zwischen Programmstarts, skinfarben, schließbar, beim Raumeintritt weg |

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
