# KIZUNA – private Gaming-Kommunikation (0.4.0 vorbereitet, noch nicht freigegeben)

KIZUNA ist eine Windows-Desktop-Anwendung auf Basis von Electron, React und WebRTC. Ziel: unkomplizierter Sprachchat, mehrere gleichzeitige Bildschirmstreams und eigene Gaming-Sounds für kleine Freundesgruppen.

**Wichtig:** `main` enthält die bisherige Ausgangsversion 0.3.2; der Entwicklungsbranch bereitet 0.4.0 vor. Der Branch `feat/retro-modern-skins` (Draft-Pull-Request #1) enthält zusätzliche Funktionen, die auf GitHub gebaut und durch Unit-Tests geprüft wurden, aber **noch nicht auf zwei realen Windows-PCs abgenommen oder an alle Nutzer verteilt wurden**.

## Funktionen im Entwicklungsbranch

- Private Räume bis vier Teilnehmer mit WebRTC-Audio, Kamera und gleichzeitigen Bildschirmstreams; direkte Verbindung soweit NAT und Netzwerk es zulassen.
- Spielsound **pro fremdem Bildschirm** separat stummschalten; Sprachchat und Soundboard bleiben unabhängig hörbar.
- Getrennte Lautstärken für Sprache, Spielton und Soundboard, zusätzlich individuelle Sprachlautstärke, Stummschaltung und Reaktions-/Soundboard-Filter je Mitspieler; Mikrofontest mit rein lokaler 3-Sekunden-Aufnahme.
- Diagnosebericht mit technischen WebRTC-Werten zum manuellen Kopieren und vorsichtige Hinweise bei wiederholt auffälligen Audiopuffern/Netzwerkverlusten. Teilnehmernamen können im Bericht enthalten sein.
- Streaming-Presets: Football Manager (1440p30), Gaming (1440p60), Sparmodus (1080p30), je nach erreichbarer Hardware/Netzwerkleistung.
- Neun auswählbare Themes vom Winamp-Retro-Stil bis zu Modern Glass; Fokusmodus, Vollbild und verschiebbare Kamera.
- Eine neue Fußballweisheit bei jedem Programmstart: 36 eigene Offline-Sprüche ohne unmittelbare Wiederholung, schließbar, passend zum aktiven Skin.
- Skin-abhängiger Sprecherrahmen; pegelbasiert, nicht sprachspezifisch; visuelle Reaktionen und über 100 Fußball-/Gaming-/Standard-Emojis mit lokalen Favoriten.
- Spielerprofile mit kompaktem Profilfoto (96 × 96), Bio und Lieblingsspiel; Weitergabe an verbundene Peers, keine zusätzliche Cloud-Datenbank.
- Gaming-Kalender: Termine, wöchentliche Wiederholung, Monat und Terminliste, lokale Erinnerung bei **geöffnetem** KIZUNA, ICS-Export, manuell vorbereitete WhatsApp-/E-Mail-Nachrichten und Teilen in der Lounge.
- Eigene WAV/MP3/OGG/FLAC-Sounds importieren und nach zweistufiger Bestätigung löschen; drei optionale, vollständig synthetisch generierte KIZUNA-Signaltöne ohne externe Aufnahmen.
- Datenspeicherung in lokaler SQLite und verschlüsselte Geheimnisse mit Windows Secure Storage.

## Installation und Updates

Eine neue Windows-Installationsdatei ist **noch nicht freigegeben**. Der signierte P2P-Updateweg ist Teil der bestehenden Implementierung. Der zentrale Updatekanal ist bewusst deaktiviert, bis Publisher-Identität und Windows-Signaturprüfung korrekt eingerichtet und real getestet sind. Kein stilles Update und keine ungesicherte Umgehung.

Bestehende interne `voxrally://`-Links, Anwendungskonfiguration und Nutzerdatenpfade bleiben aus Kompatibilitätsgründen vorerst erhalten.

## Entwicklerstart

Node 24+, pnpm:
- `pnpm install --frozen-lockfile`
- `pnpm build` (TypeScript-Prüfung und Vite-Build)
- `pnpm test` (Sicherheits-, Medienprotokoll- und Feature-Unit-Tests)
- `pnpm start` (Electron lokal)
- `pnpm test:desktop` (lokaler Desktop-Smoke-Test, geeignete Umgebung erforderlich)

Vor Release ist ein manueller Test auf zwei echten PCs und unter verschiedenen Netzen erforderlich: siehe [Hardware-Abnahme](docs/HARDWARE_ACCEPTANCE.md).

## Dokumente

- [Verbindliche Entwicklungs-Roadmap](docs/MASTER_ROADMAP.md)
- [Letzter Entwicklungsfortschritt](docs/DEVELOPMENT_PROGRESS.md)
- [Übergabe an weitere KI-Sitzungen](HANDOFF.md)
- [Windows-/Codex-Übergabe](docs/WINDOWS_HANDOFF.md)
- [Nitro-ähnliche Funktionen nach Nutzwert](docs/NITRO_FEATURE_REVIEW.md)
- [Tonquellen und Nutzungsrechte](docs/SOUND_SOURCES.md)
- [Test- und Sicherheitsanforderungen](docs/TESTING.md)

**Nicht abgeschlossen:** stabile Ende-zu-Ende-Tonlatenz, belastbarer 1440p60-Hardwarebenchmark, signierte zentrale Releases, automatische E-Mail-/WhatsApp-Erinnerungen und vollständige unabhängige Sicherheits-/Dauertests. Diese Funktionen dürfen nicht als produktiv verfügbar bezeichnet werden.
