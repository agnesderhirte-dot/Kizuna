# Changelog

## Unreleased – geplante KIZUNA 0.4.0 (16.11.2026, noch nicht installiert oder freigegeben)
- V1-Datenbank vor dem Upgrade automatisch als konsistenten, auf Integrität geprüften SQLite-Snapshot sichern.
- P2P-Updateangebote bleiben auf ihren Raum beschränkt; verspätete Auswahldialoge veröffentlichen nichts im neuen Raum.
- Gezielter Diagnosebericht für bekannte moderate Build-Abhängigkeits-Advisories ergänzt.

- Mikrofon- und Bildschirmfreigaben werden nach einem Raumwechsel/Abbruch nicht nachträglich wieder aktiviert.
- SQLite-Upgrade von 0.3.2 auf 0.4.0 mit transaktionaler Migration, Schema- und Datenerhaltprüfung (automatisiert).
- Lokalen LAN-Signaling-Server beim Verlassen von Räumen schließen und ausstehende Capture-Tickets invalidieren.
- Profilbild im eigenen Seitenleistenprofil und korrekte Spielkalender-Überschrift anzeigen.
- Sicherheitsprüfung für Produktions- und Entwicklungsabhängigkeiten um High/Critical-Meldungen erweitert; zwei Moderate in Dev-Abhängigkeiten bleiben dokumentiert.
- 36 eigene Fußballweisheiten: bei jedem Start ein neuer Offline-Spruch, ohne unmittelbare Wiederholung, im gewählten Skin, schließbar.
- Weniger unnötige Electron-Medienstatusaufrufe und keine Audio-Ausgabe-Neukonfiguration bei Lautstärkebewegungen.
- Soundboard-Dateien nach Stopp, Fehler und Raumwechsel zuverlässiger aus dem Speicher entfernen.
- Veraltete Hintergrundbild-Ladevorgänge werden ignoriert.
- Neun Skins inklusive Winamp Retro, Messenger 2003, Neon Wave und Modern Glass, Skin-Galerie und Streaming-Fokusmodus.
- Mikrofonbasierte Sprecherumrandung, Fußball-/Gaming-Emojis und speicherbare Reaktionsfavoriten.
- Bildschirm-Spielton je Teilnehmer separat stummschaltbar, ohne Sprachchat oder Torhymnen zu beeinflussen.
- Individuelle Sprachlautstärke und Mute je Mitspieler; dessen Emojis und Soundboard-Beiträge lassen sich unabhängig ausblenden.
- Diagnosewerte nach Nutzerklick kopieren, inklusive Hinweis auf möglicherweise enthaltene Teilnehmernamen.
- Qualitätsberatung erst bei dauerhaft erhöhten Audio-/Videopaketverlusten, Audiopuffern oder RTT.
- Eigene Sounddateien mit zweistufiger Bestätigung aus der lokalen Bibliothek entfernen.
- Doppelte WebRTC-Datenkanäle und bösartige/zu große ICE-Kandidaten zurückweisen.
- Sound-Cache-Bestätigungen begrenzen, ausstehende Soundwiedergaben beim Sitzungsende aufräumen.
- Verschlüsselte Cloud-Signalisierung gegen übergroße Nachrichtenwarteschlangen schützen.
- Rasterbild-Abmessungen schon vor der Electron-Dekodierung prüfen.
- CI-Sicherheitsprüfung auf High-/Critical-Laufzeit-Advisories ergänzt.
- Bild und Spielton sichtbarer Streams über dasselbe Wiedergabeelement; Soundboard-Cache und weniger künstliche Wartezeit.
- 1440p30-/1440p60- und Sparprofile, ausführliche WebRTC-FPS-, Latenz-, Jitter- und Paketverlustdiagnose.
- Lokaler Mikrofontest mit kurzer, nur im Arbeitsspeicher gehaltener Testaufnahme.
- Benutzerprofile mit verkleinerten Fotos, Spielerbeschreibung und Lieblingsspiel über den bestehenden P2P-Kanal.
- Spielkalender mit lokalem Windows-Hinweis bei geöffnetem KIZUNA, wöchentlicher Wiederholung, Monatsansicht, ICS-Export und manuell vorbereiteten E-Mail-/WhatsApp-Einladungen.
- Drei optional installierbare, eigene synthetische KIZUNA-Signaltöne.
- Verbesserter Updatehinweis mit begrenzten Versionsänderungen, wenn ein sicher konfigurierter zentraler Releasekanal zur Verfügung steht.
- GitHub-Actions-Build- und Regressionstests.
- **Release-Hinweis:** Windows-/Zwei-PC-/Tonlatenz-/1440p60-Abnahme, Zertifikat und Produktivfreigabe fehlen noch. Keine automatische Veröffentlichung erfolgt.

## 0.3.1 — 2026-11-15
- Fixed initial WebRTC offer collision: only the joining peer starts negotiation, preserving the data channel when existing participants already share media.
- Local four-peer test with three additional leave/rejoin cycles passed. Public PeerJS signaling test passed with local clients; separate Internet connections remain unverified.
- Packaged fullscreen, movable camera overlays, quality controls, four original Manager-inspired skins, backgrounds, emoji, invitation/mail draft and signed update transfer verified.


## 0.1.0 — 2026-11-11
- New Windows implementation from requirements; no prior code imported.
- Hardened Electron bridge, React interface, SQLite persistence and encrypted secret storage.
- Private signaling, four-peer cap, WebRTC negotiation/ICE handling, audio/video and basic DataChannel chat/sound.
- Quality controls, RTP measurements, custom backgrounds, persistent sound imports, mute/deafen.
- Unit/integration and two-instance desktop verification; development installer pipeline.
- Stable release not approved; hardware/network/soak and feature completion remain open.
