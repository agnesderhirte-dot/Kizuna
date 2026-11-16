# KIZUNA – Tonquellen und Nutzungsrechte

Stand: 16.11.2026.

## Mitgelieferte optionale Signaltöne
Drei Sounds werden vollständig aus dem eigenen Quellcode `desktop/bundled-sounds.cjs` synthetisiert und beim ausdrücklichen Klick auf „3 kostenlose KIZUNA-Signaltöne hinzufügen“ erzeugt:
1. **KIZUNA – Tor-Signal**: kurze selbst entwickelte Folge synthetischer Sinustöne und Obertöne.
2. **KIZUNA – Anpfiff**: kurzer frequenzmodulierter Sinuston.
3. **KIZUNA – Stadionapplaus**: synthetisch erzeugte, rhythmisch modulierte Geräuschimpulse.

Quellcode und Audiodaten enthalten keine fremden Aufnahmen, Vereinslieder, Realstadion-Aufnahmen, Samples oder extern heruntergeladene Dateien. Es wird keine Lizenz eines fremden Urhebers vorausgesetzt. Diese Töne sind bewusst einfache Originalsignale und keine Ersatzbehauptung für echte lizenzierte Fangesänge.

## Fremde freie Sounddateien
Es werden **keine ungeprüften CC0/Creative-Commons-Dateien gebündelt**. Vor Aufnahme zusätzlicher externer Sounds sind Originalquelle, Urheber, exakte Lizenzfassung, erlaubte kommerzielle Nutzung, Bearbeitungsrecht und Attribution einzeln nachzuweisen. CC-BY/SA-Bedingungen müssen erfüllt werden. Unklare Nutzungsrechte = kein Bundle.

## Eigene Uploads
Nutzer können eigene WAV/MP3/OGG/FLAC-Dateien in die private lokale Bibliothek importieren. Die Weitergabe an andere Nutzer erfolgt über den vorhandenen privaten Peer-Datenkanal. Die Nutzungsrechte an den hochgeladenen Dateien sind von den Nutzern selbst zu prüfen. Der Import ist **keine** automatische Lizenzfreigabe.

## Technische Eigenschaften
- WAV PCM 16 Bit, mono, 22.050 Hz; rein lokale Erzeugung, reproduzierbar.
- Übertragung nur bei gewähltem Sound, 10-MB-Grenze und Peer-Datenkanal-Flow-Control.
- Wiederholte Wiedergabe nutzt SHA-256-Hash-Cache und Bestätigungen.
- Tests: `tests/bundled-sounds.test.cjs` und `tests/audio-routing.test.cjs`.
