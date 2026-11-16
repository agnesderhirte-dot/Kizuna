# KIZUNA – Übergabe für die Windows-/Codex-Phase

**Status:** Vorbereitung für Version 0.4.0 im Branch `feat/retro-modern-skins`, Draft-PR #1. `main` und bestehende Installationen sind **unverändert**. Es gibt **keinen** freigegebenen Installer und **keine** automatische Veröffentlichung.

## A. Vor dem ersten Test

- Windows 10/11, funktionierendes Mikrofon/Headset, möglichst zwei physische PCs; für reale P2P-Tests zwei unterschiedliche Netzwerkanschlüsse hilfreich.
- Repository klonen und **den Entwicklungsbranch** `feat/retro-modern-skins` verwenden, nicht einen ungetesteten Stand aus `main`.
- Node.js 24 und pnpm 10 installieren; im Repo `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test`, anschließend `pnpm test:desktop` ausführen.
- Bestehende Nutzerdaten unter `%APPDATA%\\VoxRally` **vor dem ersten Upgrade sichern** (SQLite inklusive WAL/SHM, Profilbilder, Sounds, Settings).
- Für die Testphase keine zentrale automatische Updatequelle und keinen unsignierten fremden Installer aktivieren.

## B. Windows- und Zwei-PC-Abnahme nach Priorität

1. **Datenmigration 0.3.2 → vorbereitete 0.4.0:** Datenbank nach neuer Transaktionsmigration (Version 2) öffnen; Einstellungen, Chatverlauf, Profilbild, eigene Hintergründe/Sounds und Kalender nach Neustart nachweisen. Alte `de.voxrally.desktop`/ `voxrally://`-Identität muss weiter funktionieren.
2. **Mikrofon und Ton:** lokaler Selbsttest, Sprache mit zwei Freunden, Soundboard + Spielaudio getrennt, individuelle Mute-/Lautstärkeschalter; insbesondere keine doppelten Töne im Fokus-/Gitter-/Vollbildmodus.
3. **Verzögerung messen:** End-to-End-Audio-/Video-Latenz mit zwei PCs aufnehmen, nicht nur WebRTC-RTT/Jitter ablesen. Upload im Hintergrund erzeugen und vergleichen. Schwankungen dokumentieren.
4. **1440p60:** denselben Football-Manager-Inhalt abwechselnd als 1440p30, 1440p60, 1080p30 senden; auf Empfangs-PC FPS, Bitrate, Paketverlust, Puffer sowie CPU/GPU/RAM und tatsächliche Schärfe messen. Beide Nutzer übertragen anschließend gleichzeitig.
5. **Stabilität:** Raumwechsel, Abbruch, Sleep/Wake, Netzwerkwechsel, 1-Stunden- und 4-Stunden-Soak-Test. Prüfen, dass Mikrofon- und Bildschirmfreigaben nach dem Verlassen nicht verspätet wieder aktiv werden; lokaler Signaling-Port muss schließen.
6. **Optik und Nutzerführung:** neun Skins, Profilbilder, neue Start-Weisheiten, Kalender, Emoji-Overlays, Soundboard-Löschung und Einstellungen bei verschiedenen Fenstergrößen überprüfen.
7. **Sicherer Upgradeweg:** Erst nach den Tests Windows-Publisherzertifikat und Release-Repo/-Kanal konfigurieren, Authenticode-Signatur validieren, Freigabe durch Auftraggeber einholen und anschließend eine **installierte** 0.3.2-Variante auf die nächste Version aktualisieren, ohne Datenverlust.

## C. Minimale Messdaten pro Hardware-/Streamingtest

- Windows-Version, CPU, GPU, verfügbare Uploadrate, Transport (direkt/STUN/TURN), Anzahl Teilnehmer.
- Gewähltes und tatsächlich ankommendes Videoformat; angeforderte/empfangene FPS und Bitrate, Frame-Drops, Videoverlust.
- Audio-Jitter, Audiopuffer, Audioverlust, RTT sowie separate echte Ende-zu-Ende-Verzögerung in Millisekunden.
- RAM-/CPU-/GPU-Auslastung und subjektive Ton-/Bildqualität über die Testdauer.
- Fehlermeldungen, Git-SHA, KIZUNA-Version und wenn möglich anonymisierter Diagnosebericht. Teilnehmernamen vor Weitergabe entfernen.

## D. Was jetzt ohne deinen Windows-PC vorbereitet ist

- GitHub Actions für TypeScript-Build, Unit-/Sicherheitsprüfungen und Runtime-/Dev-Dependency-Audit.
- Versionierte, transaktionale Datenbankmigration für Version 2 und vorbereitete App-Version **0.4.0**.
- Medien-Lebenszyklusprüfungen, Sound-Cache-Limits, Signaling-Abbruch-/Queue-Schutz, Bildimport-Grenzen.
- Neun Designs, Sprecherrahmen, Emoji-Overlays, private Soundbibliothek, Kalender, Profile und Start-Fußballweisheiten.
- Updatecode ist vorhanden, aber eine reale signierte Windows-Releasekette **nicht** konfiguriert.

## E. Codex-Arbeitsauftrag auf dem Windows-PC

> Übernimm das Repository agnesderhirte-dot/Kizuna und den Entwicklungsbranch feat/retro-modern-skins; beachte docs/MASTER_ROADMAP.md, docs/DEVELOPMENT_PROGRESS.md, docs/SECURITY_AUDIT.md und diesen Windows-Handoff. Beginne mit dem Vergleich der aktuellen Git-SHA und CI-Ergebnisse, baue die vorbereitete Version 0.4.0, führe die Desktop- und Zwei-PC-Abnahmetests gemäß Abschnitt B durch und behandle gefundene Probleme nach Priorität P0 vor P1. Verändere weder App-ID noch voxrally://-Links, bestehenden UserData-Pfad oder Signatur-Vertrauensbasis. Gib bei jeder Änderung Tests, Messwerte und verbleibende Risiken an. Kein Merge nach main, keine signaturlose Umgehung, kein produktiver Installer und kein Nutzer-Update ohne ausdrückliche Freigabe. Wenn eine Aufgabe wegen fehlender Hardware/Zertifikate nicht testbar ist, dokumentiere das statt einen Erfolg zu behaupten.

## F. Freigabekriterien

- Alle Builds und Tests auf dem tatsächlich zu veröffentlichenden Commit grün.
- Datenmigration inklusive Wiederherstellungsprobe und Neustart funktioniert.
- Echte Tonqualität und Latenz geprüft; Ergebnis nachvollziehbar dokumentiert.
- 1440p60 unter der vorhandenen Hardware-/Netzwerkkonfiguration ausreichend stabil, ohne pauschale Garantie.
- Sicherheitsrisiken geprüft, kein offenes schwerwiegendes Problem.
- Signierter, verifizierbarer Releaseweg; einwilligungsbasierter Download und keine Installation während eines aktiven Spielabends.
- **Ausdrückliche Freigabe**, bevor ein Update an andere Nutzer verteilt wird.
