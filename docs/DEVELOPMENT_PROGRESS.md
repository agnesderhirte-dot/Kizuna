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

## 2026-11-16 – weitere GitHub-only Features und Regressionstests (KZ-016–018)
- **Individuelles Mithören**: `src/ParticipantAudio.tsx` zeigt für jeden verbundenen Mitspieler eine gesonderte Sprachlautstärke, einen Voice-Mute und unabhängig davon Schalter für dessen Reaktionen und Soundboard-Sounds. Die Audioelemente für Spielstreams bleiben unverändert; `src/audio-mix.ts` begrenzt allein den lokalen Sprachgain. Peer-spezifische Einstellungen sind bewusst nur für die aktuelle Raumverbindung.
- **Peer-Reaktionen und Soundboard lokal ausblenden**: `Mesh.onSound` übermittelt die vorhandene Peer-ID, der Empfänger prüft eigene Blocklisten. Inbound-Effekte werden nur lokal unterdrückt; Sprachchat und Spielsound bleiben erhalten.
- **Diagnoseexport**: `src/diagnostic-report.ts`, `copyDiagnostics` im durch Runtime-Validierung geschützten Electron-IPC, UI-Kopierbutton. Enthält angeforderte Streamingparameter und angezeigte WebRTC-Messwerte, keine Chat- oder Einladungsinhalte. Teilnehmeranzeigenamen können enthalten sein, daher Aufforderung zur Prüfung vor Weitergabe. Keine automatische Telemetrie/Serverübermittlung.
- **Qualitätshinweise**: `src/QualityAdvisor.ts` erkennt wiederholte auffällige Werte bei Audioverlust, Audiopuffer, Videoverlust und RTT. Erst nach drei aufeinanderfolgenden schlechten Messwerten wird eine Empfehlung angezeigt. Kein FPS-Alarm allein bei statischen Bildern; keine versteckte Encoder- oder Netzwerkumschaltung.
- **Sound-Bibliothek aufräumen**: neue IPC-Aktion `deleteSound`, nur hashvalidierte Sounddateien. Die Oberfläche fordert die Löschung zweimal an. Profile/Bilder/Hintergründe und sonstige Assets werden nicht gelöscht.
- **Tests**: `tests/peer-audio.test.cjs`, `tests/peer-effects.test.cjs`, `tests/diagnostic-report.test.cjs`, `tests/sound-library.test.cjs`, `tests/quality-advice.test.cjs` und überarbeitete `tests/audio-routing.test.cjs`.
- **Grüner GitHub-CI-Nachweis**: [Run 43825148728](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43825148728), Commit `c67db4bae8886750e5bffef59ec101bddf329820`; `pnpm build` PASS, `pnpm test` **66 bestanden / 0 fehlgeschlagen / 1 übersprungen**. Die danach vorgenommenen Warntext- und Dokumentationscommits werden durch nachfolgendes CI erneut validiert.
- **Immer noch offen**: Reale Windows-Voice-/Mute-/Latenztests mit zwei PCs, Hardware-Benchmark 1440p60, vollständiges Sicherheits- und Langzeitaudit, Codesigning-/Release-Infrastruktur und Freigabe. Keine Installation oder Aktualisierung auf Nutzer-PCs durchgeführt.

## 2026-11-16 – Masterprompt KZ-013: Sicherheit/Stabilität und KZ-014-Auditvorbereitung
- WebRTC mit Kandidatenvalidierung, doppelten Datenkanälen, peergebundenen Soundbestätigungen, 32er Cache-Limit und zuverlässigerem Aufräumen der Audio-/Streamressourcen gehärtet.
- Verschlüsselte Cloud-Signalisierung besitzt zusätzliche Inbound-/Outbound-Queue-Limits und 10-Sekunden-Bytebudgets. Veraltete Verbindungspakete werden nicht weiterverarbeitet.
- PNG/JPEG/GIF/WebP-Abmessungen werden vor der Electron-Bilddekodierung geprüft (Pixelbudget 8 MP Avatar, 16 MP sonstige Bilder; Avatar bis 4 MiB Dateigröße).
- Neue Tests: `mesh-hardening`, `signaling-hardening`, `image-limits`. GitHub CI erweitert um `pnpm audit --prod --audit-level high`.
- **Nachweis:** [Actions-Run 43828763644](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43828763644), Commit `f61ec2a953ab41fc6c40ef0187ce9f642e0047d3`, Build bestanden; **74 Tests bestanden / 0 fehlgeschlagen / 1 übersprungen**; Runtime-Audit meldete keine bekannten Schwachstellen.
- Sicherheitsbericht: `docs/SECURITY_AUDIT.md`; verbleibende Risiken: dauerhafte Peeridentität, unverschlüsseltes LAN-Signaling, Decoder-Fuzzing, Windows-Zwei-PC-/Langzeittests, reale 1440p60-/Audio-Messungen, signierter Updatepfad und unabhängiges Schlussreview.
- **Kein Merge nach main, kein neuer Installer, keine Veröffentlichung.**

## 2026-11-16 – KZ-020 Fußballweisheiten und KZ-014 Performance-Durchlauf
- 36 selbst verfasste, kurze Fußballweisheiten in `src/FootballWisdom.ts`; Anzeige beim Programmstart unabhängig vom Netzwerk. Gespeichert wird nur der zuletzt verwendete numerische Index, sodass beim folgenden Start nicht unmittelbar derselbe Spruch erscheint. Schließen über ×, automatische Ausblendung beim Betreten eines Raums. Stil über vorhandene Skin-Akzentfarbe, keine Assets, externe APIs oder Copyright-Zuschreibungen.
- `src/MediaActivityGate.ts`: Electron-IPC für aktives Mikrofon bzw. geteilte Medien nur noch bei Statuswechsel statt nach jeder UI-/Peer-Änderung. Fehler erlaubt Wiederholung.
- `src/SoundPlaybackPool.ts`: HTMLAudioElement und Blob-URLs bei Audio-Ende, Fehler, manuellem Abbruch, Verlassen des Raums und React-Unmount freigeben.
- Audio-Ausgabegerät in `src/main.tsx` und `src/VideoStage.tsx` ausschließlich bei tatsächlicher Ausgabeänderung neu konfigurieren; Lautstärkeregelung getrennt davon.
- Asynchroner Hintergrundbild-Import ignoriert bereits überholte Resultate.
- Regressionstests: `tests/football-wisdom.test.cjs`, `tests/runtime-performance.test.cjs`; bestehende Tests bei geänderter Audio-Ausgaberoutine angepasst.
- **GitHub Actions**: [Run 43835700399](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43835700399), `pnpm build` erfolgreich, **83 Tests bestanden, 0 fehlgeschlagen, 1 übersprungen** und `pnpm audit --prod --audit-level high` erfolgreich.
- Unverändert offen: Windows-GUI, realer Audio-/1440p60-Benchmark, unabhängige Schlussprüfung KZ-014 und sichere signierte Releasekette. Keine Freigabe, keine Änderung der installierten Version.

## 2026-11-16 – Weitere GitHub-Entwicklung ohne Codex (KZ-021–024)

- Medienfreigaben bleiben an die aktuelle Sitzung gebunden: `sessionEpoch` wird bei Einstieg, Ausstieg und Unmount erhöht. Zu spät aus `getUserMedia` oder `getDisplayMedia` eintreffende Streams werden sofort gestoppt. Alte `onended`-Callbacks können einen neueren Bildschirm nicht mehr abschalten.
- `desktop/main.cjs`: `stopHosting` schließt den lokalen Signaling-WebSocket-Server beim Raumverlassen oder Wechsel von LAN zu Cloud und umgekehrt. `disconnect()` löscht ausstehende Capture-Tickets.
- `desktop/migrations.cjs`: versioniertes, transaktionales SQLite-Upgrade (v1→v2). Tabellen-/Spaltenvalidierung, Rollback bei Schemafehlern, keine Rücksetzung von `PRAGMA user_version` bei jedem Start. Migrationstest bestätigt Erhalt von Settings, Assets und alten Nachrichten.
- Im Branch **0.4.0** als nächstes, noch nicht freigegebenes Release vorbereitet. App-ID `de.voxrally.desktop`, Protokoll `voxrally://`, EXE-Name und Nutzerdatenpfad `VoxRally` bleiben für Upgrades gleich. Zentraler Updatekanal bleibt deaktiviert bis zur Codesignatur und Windows-Abnahme.
- Tests `media-capture-lifecycle.test.cjs`, `migrations.test.cjs`, `room-teardown.test.cjs`, `release-readiness.test.cjs`, `ui-accessibility.test.cjs` hinzugefügt.
- GitHub-Workflow prüft `pnpm audit --prod --audit-level high` **und** `pnpm audit --audit-level high`; der jüngste geprüfte Lauf meldete zwei **moderate** Entwicklungsabhängigkeits-Advisories, aber keine High/Critical. Details bei Bedarf im CI-Protokoll prüfen.
- Nitro-/Komfort-Nutzwertabgleich: `docs/NITRO_FEATURE_REVIEW.md`. Konkrete Windows-Codex-Übergabe: `docs/WINDOWS_HANDOFF.md`.
- Keine Real-PC-, Windows-Ende-zu-Ende-, 1440p60-/Audio-Soak-, signierte Upgrade- oder Zertifikatsprüfung durchgeführt. **Keine Freigabe, kein Merge, kein Installer, keine Nachricht an andere Nutzer.**
