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
| KZ-001 | P0 | Bestandsaufnahme, Test-Baseline, Sicherheits-/Medienrisiken | GPT-6 High | In Arbeit | Code-/Testinventar, Build und Baseline-Messwerte; echte Zwei-PC-Abnahme offen |
| KZ-002 | P1 | Neun Skins und Skin-Galerie inklusive Fokusmodus | GPT-6 Medium, Review High | Implementiert im PR #1 | TypeScript/GUI/Regression, Skinwechsel im Stream, Datenerhalt |
| KZ-003 | P1 | Sprecherumrandung (Mikrofon statt Spielaudio) | GPT-6 High | In Arbeit | Lokal/remote korrekt sichtbar, Timeout, Mute, Vollbild, Tests, begrenzter CPU- und Signaling-Overhead |
| KZ-004 | P1 | Synchrone Fußball- und Standardreaktionen | GPT-6 Medium | Offen | Whitelist, Peer-Ratenlimit, visuelle Overlays, Vollbild, Blockierbarkeit |
| KZ-005 | P0 | Schlechter Ton: Messung + Geräte-, Opus- und Loopback-Diagnose | GPT-6 High | Offen | Reale Hörtests sowie Jitter/Verlust/Latenz dokumentiert |
| KZ-006 | P0 | 1440p60: Capture/Encoder/Netzwerkprofile benchmarken | GPT-6 Extra High | Offen | Soll-/Ist-FPS, Bitrate, RTT, Drops, CPU/GPU auf zwei PCs; keine unbelegte FPS-Garantie |
| KZ-007 | P1 | Soundboard: eigene Tracks und legal lizenzierte freie Effekte | GPT-6 Medium/High | Offen | Dateiformate, Lautheit, Rechte/Lizenzprotokoll, Empfänger-Test |
| KZ-008 | P2 | Benutzerprofile mit Profilbild, Banner, Teilen und Datenschutz | GPT-6 Medium | Offen | Dateiprüfung, Größenlimit, Thumbnail, Remote-Darstellung, Persistenz |
| KZ-009 | P2 | Komfortfunktionen nach Nitro-Nutzwertprüfung | GPT-6 Medium | Offen | Sinnvolle Funktionen statt blindem Nachbau; Tests pro Feature |
| KZ-010 | P2 | Spielkalender, Wiederholung, lokale Windows-Erinnerungen | GPT-6 Medium | Offen | ICS, Zeitzonen, Zustellung und Datenerhalt |
| KZ-011 | P3 | Optionale E-Mail-/WhatsApp-Erinnerungen | GPT-6 High | Offen | Opt-in, verifizierter Versandweg, WhatsApp nur offiziell; ggf. Kostenfreigabe |
| KZ-012 | P0 | Zentraler Updateservice + signierter Upgradepfad | GPT-6 Extra High | Blockiert (Signatur/Release-Konfiguration) | Kein unsigniertes Vertrauen; echter installierter Versionswechsel, aktiven Stream schonen |
| KZ-013 | P0 | Sicherheit, Netzwerk- und Langzeittests | GPT-6 High | Offen | Zwei reale PCs, getrennte Netze, 1h/4h Soak, Wiederverbindung |
| KZ-014 | P0 | Abschließendes Architektur-/Performance-Audit | GPT-6 Extra High | Offen | Zweites Review, konkrete Messwerte, offene Restrisiken |

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
