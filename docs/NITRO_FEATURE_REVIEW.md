# KIZUNA – Nitro-ähnliche Komfortfunktionen: Nutzwertprüfung

Stand: 16.11.2026. Leitprinzip: private, kostenlose Gaming-Kommunikation für 2–4 Personen. Kein direkter Discord-Quellcode oder Markenauftritt; eigene UX und eigene Icons/Töne. Priorität hat **verlässliches 1440p60 mit guter Tonqualität** statt Oberflächenkosmetik.

| Komfortfunktion | Status | Nutzen | Einfluss auf Ressourcen / Kosten | Entscheidung |
|---|---|---|---|---|
| Höhere Streamingqualität | Profile 1440p30/60, 1080p30 integriert | Sehr hoch für FM/Gaming | Upload pro Empfänger; Hardware und Netz variieren | Beibehalten, **real testen** |
| Zwei oder mehr gleichzeitige Bildschirmstreams | WebRTC-Mesh im Branch | Sehr hoch | N × Encoder/Upload; bei 4 Peers keine unbegrenzte Skalierung | Beibehalten, Performance-Limit kommunizieren |
| Individuell steuerbarer Spielsound | Im Branch | Sehr hoch | Kein zusätzlicher Netzwerktraffic | Beibehalten |
| Individuelle Lautstärke und Mute je Teilnehmer | Im Branch | Hoch | Nur lokale Audio-Elemente | Beibehalten |
| Eigene Kamera-/Streaming-Hintergründe | Im Branch | Hoch für Football Manager | Optional GPU/CPU-Aufwand durch Bildfreistellung | Opt-in; standardmäßig keine Videofilter |
| Fußball- und klassische Emojis, Favoriten, Overlay | Im Branch | Hoch | Wenige Datenbytes, begrenzte Rate | Beibehalten |
| Eigene Torhymnen / Soundboard | Im Branch | Hoch | Erste Dateiübertragung; Hash-Cache danach | Dateigrenzen und Rechtehinweise beibehalten |
| Eigene Profilbilder, Bio, Lieblingsspiel | Im Branch | Mittel | 96×96-JPEG per Peer; überschaubar | Beibehalten |
| Profilbanner / animierte Avatare | Nicht vollständig umgesetzt | Mittel | Zusätzlicher Datenverkehr, Decode-/GPU-Last, Moderation | **Nach Windows-Abnahme optional**; nicht für 0.4.0 erforderlich |
| Eigene Sticker/GIFs im Chat | Nur Emoji-Overlay, keine Stickerdateien | Niedrig–mittel | Zusätzlicher Assettransfer, mögliche problematische Inhalte | Vorläufig zurückstellen |
| 500 MB Uploads und große Dateiablage | Nicht umgesetzt | Niedrig für 2–4 Spieler | Upload, Speicher, Malware-/Urheberrechtsrisiken | Bewusst **nicht** nachbauen |
| Server-Boosts / Community-Abzeichen | Nicht umgesetzt | Gering für privaten 4-Personen-Raum | Kontosystem, Synchronisation, Branding | Bewusst **nicht** nachbauen |
| Werbefreie Oberfläche | Keine Werbeinfrastruktur | Hoch | Keine laufenden Kosten | Beibehalten |
| Kalender / Terminerinnerungen | Lokal und ICS umgesetzt | Hoch | Kein externer Service nötig | Beibehalten |
| Automatische E-Mail-/WhatsApp-Erinnerungen | Nur manuelle Einladungsentwürfe | Optional | Externer Provider, Identifikation/Einwilligung/Kosten | Blockiert bis zur expliziten Verbindung und Freigabe |

## Ergebnis

Für die nächste Version gilt ein klarer Scope: **Tonqualität, P2P-Stabilität, 1440p60-Hardwaretest, Profile, Emojis, Soundboard, Skins und vorhandener Kalender**. Zusätzliche Animationen, riesige Dateien und komplexe Community-Funktionen würden Ressourcen verbrauchen, ohne das Hauptziel spürbar zu verbessern.

Keine Funktion darf als „kostenlos garantiert“, „60 FPS unter allen Bedingungen“ oder als automatische WhatsApp-Zustellung beworben werden, solange das nicht nachgewiesen beziehungsweise eingerichtet ist. Mehrwert und Risiken der Funktionsauswahl sind geprüft; die Live-Abnahme ist separat offen.
