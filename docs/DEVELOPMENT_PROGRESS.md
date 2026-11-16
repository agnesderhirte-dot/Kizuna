# KIZUNA – Arbeitsfortschritt

## 2026-11-16 – Start nach Entwicklungsauftrag
- Branch: `feat/retro-modern-skins`; Pull Request #1 (Draft).
- Ausgangsbasis: KIZUNA 0.3.2, Electron/React/TypeScript, WebRTC-Mesh mit separatem Audio- und Bildstream sowie vorhandenen Datenkanälen.
- Bereits im PR #1: vier zusätzliche Skins, Skin-Galerie, Fokusmodus; automatisierte Tests für die neuen Skins wurden hinzugefügt. **Noch kein bestätigter TypeScript- oder Windows-GUI-Test dieser Änderungen.**
- Neue Priorität: KZ-003 Sprecherumrandung mit lokalem Mikrofonpegel, Zustandswechseln über bestehenden Datenkanal, Nachleuchtzeit, Timeout und CSS-Skinfarben.
- Diagnostiziert: Zentraler Updater im Ausgangsstand laut Übergabe nicht produktiv aktiviert, echte 2-PC-/Hardwareabnahme offen.
- Kein Installer erstellt, keine Veröffentlichung ausgelöst, kein privater Update-Schlüssel verändert.

## Übergabeformat nach jedem Schritt
Commit, betroffene Dateien, Status der Roadmap, nachweislich ausgeführte Tests mit Ergebnissen, offener Blocker und präziser nächster Schritt. Diese Datei vor Ende jeder Sitzung aktualisieren.

## 2026-11-16 – Meilensteine KZ-003 und KZ-004 implementiert (noch keine Release-Abnahme)
- `src/VoiceActivity.ts`: lokale Energiepegelanalyse mit Hysterese und ressourcenschonendem 100-ms-Intervall; keine Audioaufzeichnung, kein zusätzlicher Encoder. Es handelt sich um eine pegelbasierte Aktivitätsheuristik, **nicht** um eine perfekte Spracherkennung.
- `src/mesh.ts`: Sprechstatus nur über vorhandenen Datenkanal; Zustandsänderungen und sparsame Heartbeats, 3,6-s-Timeout für Remote-Anzeige; Mute-/Cleanup-Verhalten.
- `src/VideoStage.tsx`, `src/main.tsx`, `src/style.css`: visuelle Rahmen in verschiedenen Skins, Sprecheranzeige in Teilnehmerliste, Fokus-/Vollbildunterstützung.
- `src/reactions.ts`, `src/ReactionPicker.tsx`: Fußball- und Standard-Emojis, TOR/VAR/ELFMETER, Whitelist und pro Peer maximal 6 Reaktionen je 3 Sekunden, lokale Overlays statt Stream-Neukodierung.
- Neue Tests: `tests/speaking.test.cjs`, `tests/reactions.test.cjs`, `tests/load-ts.cjs`.
- GitHub Actions: `.github/workflows/validate.yml` prüft bei PR TypeScript-Build und Unit-Tests. Momentan keine Testausführung/GitHub-Checks gemeldet.
- **Verifikation:** GitHub-Commits bestätigt; strukturelle Konsistenzprüfung offen. Kein vollständiger Renderer-/Electron-Build, keine Windows-Abnahme, kein realer Mikrofontest in dieser Sitzung. Kein Merge oder Installer/Update veröffentlicht.
- **Nächster Schritt:** CI-Ergebnisse beobachten, TypeScript-/Unit-Tests ausführen und Fehler korrigieren; dann Zwei-PC-Sprecher- und Emoji-Test, Audio-Baseline, 1440p60-Performanceprofil. Vor produktivem Release Nutzerfreigabe erforderlich.

## 2026-11-16 – CI nach Fehlerbehebung erfolgreich
- CI-Lauf: https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43775020122
- Commit: `4a57166b0a3a62af7a028f7bf00b1775dcb99469`.
- `pnpm install --frozen-lockfile` **bestanden**.
- `pnpm build` (TypeScript + Vite) **bestanden**.
- `pnpm test`: **25 insgesamt, 24 bestanden, 0 fehlgeschlagen, 1 übersprungen**.
- Frühere CI-Fehler: alte Test-Loader nutzten entfernte TypeScript-7-JavaScript-API; via Node 24 Native-TypeScript-Loader behoben. Im letzten Lauf zusätzlich fehlenden `path`-Import eines Tests korrigiert.
- Produktionsfreigabe weiterhin **ausstehend**: reales Hardware-Mikrofon, akustische Verständlichkeit, sichtbare Sprecherumrandung, Remote-Emoji-Overlay, lange Streams, Windows-/Zwei-PC-Abnahme.
- Keine App-Installation oder Updateveröffentlichung vorgenommen; PR #1 bleibt Draft.

## 2026-11-16 – Getrennter Spielsound und Verzögerungsoptimierung (KZ-015)
- `src/main.tsx`: unabhängige Stummschaltung des Bildschirmspiels pro Remote-Stream; Mikrofon und Torhymnen bleiben unabhängig hörbar. Aufnahme von Audio nur bei audiohaltigen Remotestreams. Auswahl wird beim Verlassen/Betreten eines Raums zurückgesetzt.
- `src/VideoStage.tsx`: Spielsound des sichtbaren fremden Bildschirms zusammen mit Video in **einem** HTMLMediaElement, um getrennte Pufferung zu vermeiden. Ton anderer Screens läuft im Fokusmodus über einen Audio-only-Fallback. Stummschaltung in der Toolbar und im Vollbild erreichbar.
- `src/mesh.ts`: Sounddateien bis 10 MB mit vorhandenem DataChannel-Flow-Control übertragen, per SHA-256 im Empfänger-Cache gespeichert und bei neueren Peers vor dem Start bestätigt. Bereits bestätigte Sounds müssen nicht erneut hochgeladen werden; alterskompatibler Fallback bleibt bestehen. Künstliche 600+300-ms-Wartezeit entfernt, Start nach Bereitschaft planmäßig 160 ms; erstmalige Übertragung von größeren Dateien kann dennoch länger dauern.
- `src/QualityDiagnostics.ts`: Inbound-Jitterbuffer-Verzögerung und kaschierte Audiodaten neben Jitter/Verlust sichtbar, soweit der Browser diese RTCStats liefert. Es sind **Schätzungen aus WebRTC-Statistiken**, keine gemessene Ende-zu-Ende-Audioverzögerung.
- `tests/audio-routing.test.cjs`, `tests/quality-diagnostics.test.cjs`: Spielsound-/Voice-Trennung, Ton-Synchronisation, Cache-Acknowledgements, Wiederholungsplayback und Bufferwerte getestet.
- **Build + Unit-Tests grün**: Run https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43817017128, Commit `f496c99084580b2fc7fcdc863bc19d86025b20db`. 34 erfolgreich, 0 fehlgeschlagen, 1 übersprungen.
- **Nicht getestet:** Reale Sprachlatenz, Kombination mit mehreren Windows-Ausgabegeräten, verschiedene Netzwerke, Soundboard unter hoher Last, Video-Ton-Lippensynchronität auf zwei echten PCs. Kein produktives Update, Installer oder Merge.
- **Nächster Schritt:** Auf zwei Windows-PCs im gleichen Raum FM-Stream mit Systemaudio starten; bei einem Nutzer Spielsound stummschalten, während Voice und Torjubel hörbar bleiben; Jitter, Puffer und RTT unter Netzwerklast messen und mit Baseline vergleichen. Danach Qualitätsabnahme 1440p60.

## 2026-11-16 – Direkte GitHub-Entwicklung ohne Codex-Sitzung

### Fertig im Entwicklungsbranch, Build- und Unit-Abnahme
- **KZ-008 Profile**: Gespeicherte Profilbilder werden auf 96×96 Pixel zugeschnitten, als kompaktes JPEG lokal in der vorhandenen Asset-Bibliothek abgelegt und über den bestehenden P2P-Datenkanal an verbundene Nutzer gesendet. Der Peer akzeptiert nur streng begrenzte JPEG-Daten-URIs. Lieblingsspiel, Bio und Spielername sind vorhanden; Entwürfe werden erst nach Speichern geteilt.
- **KZ-010 Kalender**: `desktop/calendar.cjs`, `src/GameCalendar.tsx`, SQLite-Tabelle, Wiederholung, Erinnerungen während KIZUNA läuft, Terminliste/Monatsansicht, ICS mit `Europe/Berlin`-Sommerzeit, Export über nativen Speicherdialog.
- **KZ-011 Terminweitergabe**: `mailto:`- und WhatsApp-Web-Entwürfe ausschließlich nach bewusstem Nutzerklick; kein automatischer Versand, kein kostenpflichtiger Dienst.
- **KZ-007 Originalsounds**: `desktop/bundled-sounds.cjs` erzeugt Anpfiff, Tor-Signal und künstlichen Stadionapplaus, ohne fremde Musik oder Downloads. Erst nach Nutzeraktion importieren, doppelte Assets vermeiden.
- **KZ-004 Reaktionen**: über 100 Unicode-Emojis in Fußball/Stadion, Jubel, Gesichter, Gaming, dazu speicherbare Favoriten mit Suchfeld; nur bei geöffnetem Menü gerendert.
- **KZ-012 Update-Vorbereitung**: Zentrale Updateabfrage kann – **wenn produktiv signiert und aktiviert** – harmlose, begrenzte Releasebeschreibungen vor dem Download anzeigen. Der zentrale Updater bleibt wegen fehlender Publisher-/Zertifikatskonfiguration deaktiviert.
- **Tests**: `tests/calendar.test.cjs`, `tests/profile.test.cjs`, `tests/bundled-sounds.test.cjs`, `tests/reaction-favorites.test.cjs`, ergänzter `tests/central-updater.test.cjs`. Stand letzter vollständig ausgeführter Prüfung: https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43820759138 (**51 bestanden, 0 fehlgeschlagen, 1 übersprungen**). Neuere Commits erneut überprüfen.

### Sicherheit und Abgrenzung
- Weder `main` noch reale KIZUNA-Installationen wurden geändert; keine Releaseveröffentlichung, kein automatischer Push an Mitspieler.
- Keine zusätzlichen Runtime-Bibliotheken, keine Cloud-Profilanbieter, kein externer Musikdienst, keine kommerziellen WhatsApp-Kosten.
- Echte Windows-Betriebs-/Mikrofon-/End-to-End-Latenztests, längerer Zwei-PC-Livebetrieb und sichere signierte Releasekette bleiben offen; diese Punkte sind keine reine Quellcodeaufgabe.
- Die lokalen Windows-Erinnerungen funktionieren **nur bei geöffnetem KIZUNA**. Termine können für Erinnerungen außerhalb von KIZUNA per ICS in einen anderen Kalender exportiert werden.
- Testanleitung: `docs/HARDWARE_ACCEPTANCE.md`. Soundherkunft: `docs/SOUND_SOURCES.md`.

### Empfehlung zur Fortsetzung
1. Prüfe den aktuellsten GitHub-CI-Lauf für den neueren SHA; auftretende Fehler vor weiteren Features beheben.
2. Reale Zwei-PC-Abnahme: Tontrennung, Profilübertragung, Skinwechsel, Reaktionen, Updateverhalten, 1440p60 und Tonlatenz.
3. Nach bestandener Abnahme Freigabe des Merge und signiertes Update-Paket vorbereiten; keine Signatur- oder Freigabeprüfungen umgehen.
