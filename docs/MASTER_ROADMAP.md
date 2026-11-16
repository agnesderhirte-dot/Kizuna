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
| KZ-013 | P0 | Sicherheit, Netzwerk- und Langzeittests | GPT-6 High | Offen | Zwei reale PCs, getrennte Netze, 1h/4h Soak, Wiederverbindung |
| KZ-014 | P0 | Abschließendes Architektur-/Performance-Audit | GPT-6 Extra High | Offen | Zweites Review, konkrete Messwerte, offene Restrisiken |

| KZ-015 | P0 | Spielsound pro Teilnehmer separat stummschalten und Audio-Video-Synchronität verbessern | GPT-6 High | CI getestet; Zwei-PC-Latenztest offen | Sprecher und Soundboard bleiben hörbar; Bild/Spielsound in einem Stream-Element; Sound-Cache, Empfänger-ACK und Verzögerungsmessung |

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
