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
