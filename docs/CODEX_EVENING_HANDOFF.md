# KIZUNA – Übergabe für die Windows-/Codex-Phase am Abend

Stand: 16.11.2026. **Diese Anleitung gilt für die Fortsetzung nach der GitHub-Entwicklung und ist keine Releasefreigabe.**

## 1. Quellstand und Belege

- GitHub-Repository: https://github.com/agnesderhirte-dot/Kizuna
- Arbeitsbranch: `feat/retro-modern-skins`
- Draft-Pull-Request: https://github.com/agnesderhirte-dot/Kizuna/pull/1
- Unveränderte Hauptversion: `main`, aktuell 0.3.2.
- Letzte separat bestätigte Linux-CI: [43842744167](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43842744167): TypeScript-/Vite-Build grün, **97 Tests bestanden, 0 Fehler, 0 übersprungen**, Produktionsabhängigkeiten ohne bekannte Sicherheitslücken.
- Bestätigter Windows-Test mit zwei KIZUNA-Instanzen, synthetischen Mikrofonen, parallelen Streams, Spielsound-Stummschaltung, Chat und Soundboard: [43842055700](https://github.com/agnesderhirte-dot/Kizuna/actions/runs/43842055700). Bei neueren Commits neuesten Workflowstand prüfen.
- Die Jobs verwenden **unsigned Windows-Testpakete**. Kein signierter Installer und kein Update für bestehende Nutzer wurde veröffentlicht.

## 2. Unverändert lassen

- Nicht neu erstellen, sondern vorhandenes Projekt fortsetzen. Projektkennung `de.voxrally.desktop`, Protokoll `voxrally://`, lokaler Datenordner `VoxRally`, Signatur-/Updatevertrauen und installierte Benutzerdaten **nicht** ungeprüft umbenennen.
- Ohne ausdrückliche Zustimmung: **kein Merge nach `main`, kein Release, kein öffentliches Update**, keine Signaturumgehung, keine Nachrichten an Mitspieler.
- Niemals neue Tests mit den vorhandenen Echtdaten starten, wenn eine isolierte Testdatenbank möglich ist.
- Updates erst nach Sicherheit, Datenerhalt, echten Hardwaretests und Freigabe.

## 3. Vorbereitung am Windows-PC (PowerShell)

1. Installiere bzw. kontrolliere **Node.js 24** und **pnpm 10** sowie Git.
2. Öffne das bestehende KIZUNA-Repository im Terminal bzw. in Codex.
3. Wechsle auf den oben genannten Entwicklungsbranch und aktualisiere ihn.
4. Führe die Build-/Regressionstests aus.
5. Starte die Anwendung mit **separatem Testdatenordner**, damit die bereits installierte Version keine Daten verliert.

Nützliche Befehle (in dieser Reihenfolge):

```powershell
git fetch origin
git switch feat/retro-modern-skins
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:desktop
$env:VOXRALLY_TEST_DATA = Join-Path (Get-Location) '.test-data\manual'
pnpm start
```

Die Tests über `pnpm test:desktop` verwenden synthetische Eingabegeräte und eigene Testdaten. Ein echter 1440p60-Test erfordert zusätzlich einen zweiten Windows-PC. GitHub-CI ersetzt **nicht** die Nutzung echter Mikrofone und der echten Netzwerke.

## 4. Physische Abnahme: Priorität P0

- **Audio, zwei PCs:** Beide Spieler sprechen gleichzeitig und senden gleichzeitig den Spielbildschirm. Prüfen: Sprache, Spielsound und Torhymnen sind unabhängig regelbar; Spielsound von Person A stumm, Stimme A und Soundboard A weiterhin hörbar. Separat Voice A und Soundboard A stumm schalten und Stimme wiederherstellen. Test mit den tatsächlich genutzten Ausgabegeräten.
- **Latenz:** Reale Ende-zu-Ende-Verzögerung von Stimme, Spielsound und Torhymne getrennt messen (z. B. synchroner hörbarer Impuls und zeitgleiche Aufnahmen). Dabei Kopie des Diagnoseberichts, Jitter, Paketverlust, Audiopuffer, RTT notieren. Ziel: subjektiv gut spielbar; keine unbelegte Millisekunden-Garantie.
- **1440p60:** Zwei echte 2560×1440-Streams mit angeforderten 60 FPS. Tatsächliche Sender-/Empfänger-FPS, Bitrate, Framedrops, CPU-/GPU-Auslastung und Netzwerkverbrauch messen. 15–30 Minuten mit Football Manager, Menüwechseln, schnellem Scrollen und längerem Standbild testen.
- **Verbindungsstabilität:** WLAN/LAN-Wechsel, kurzzeitiger Netzausfall, Neuverbindung, Raum verlassen/beitreten, gleichzeitige Sprach- und Bildübertragung, 3–4 Teilnehmer und 1- bis 4-Stunden-Dauertest. Kein übermäßiger Speicheranstieg, keine Doppelstimmen oder verlorenen Audioelemente.
- **Benutzeroberfläche:** Neun Skins und Fokus-/Vollbildansicht, Ein-/Ausblenden von Bedienknöpfen, Sprecherrahmen, Start-Weisheit, Kalender, Profile/Fotos, Emoji-Overlays, Soundimport und -löschung.
- **Updates:** Datenerhalt bei Upgrade einer vorhandenen Version, Benutzerzustimmung und signierte Herkunft prüfen. Ohne gültigen Publisher-/Update-Signaturnachweis **keinen produktiven Updatekanal aktivieren**.

Pro Fehler: exakter Schritt, erwartet/tatsächlich, Screenshot, Diagnosebericht, Windows-Version, Netzwerktopologie und Quellcommit erfassen. Bei Fehlern die Ursache beheben, dann Build/Unit-/Smoke-Tests wiederholen.

## 5. Eindeutiger Arbeitsauftrag für Codex

Übernimm das bestehende GitHub-Projekt KIZUNA im Branch `feat/retro-modern-skins`. Lies zuerst `HANDOFF.md`, `docs/MASTER_ROADMAP.md`, `docs/SECURITY_AUDIT.md` und `docs/HARDWARE_ACCEPTANCE.md`. Führe keine Neuentwicklung des Projekts durch. Analysiere die tatsächlichen Windows-/WebRTC-Probleme und behebe sie priorisiert in den Aufgaben KZ-005, KZ-006, KZ-012, KZ-013 und KZ-014. Bearbeite eine überprüfbare Teilaufgabe nach der anderen, hake erledigte Punkte in der Roadmap ab, dokumentiere jede Änderung und schaffe automatisierte Regressionstests.

Priorisiere korrekte, stabile, schnelle Übertragung von **zwei gleichzeitigen 1440p60-Streams** mit unabhängiger Sprache und Spielsound gegenüber neuen Skins oder dekorativen Funktionen. Unterscheide konsequent Soll- und Ist-Werte. Veröffentliche **keine** neue Windows-Version und führe **keinen** Merge nach main aus, solange keine ausdrückliche Freigabe, echte Hardwareabnahme und gültige Signaturkette vorhanden sind.

**Modellaufwand:** Für Gerätedebugging und normale GUI-Fehler GPT-6 Medium/High; für WebRTC-/Audio-Latenz, Encoder-/GPU-Analyse, Sicherheit, Migration und Abschlussreview GPT-6 Extra High. Arbeite gründlich und zweckmäßig statt unnötig ressourcenarm. Unterbrich bei einem fehlenden Zertifikat, nicht vorhandenem Hardwarezugriff oder erforderlicher Nutzereinwilligung und dokumentiere den Blocker präzise.

## 6. Verbleibende Blocker

- Kein automatischer E-Mail-/WhatsApp-Versand ohne einen autorisierten Anbieter, verifizierte Berechtigungen und ggf. Kostenfreigabe.
- Zusätzliche fremde Stadionmusik/Fangesänge nur nach einzeln überprüfter, rechtlich ausreichender Lizenz. Derzeit sind eigene synthetische Effekte verfügbar.
- Ohne Windows-Publisher-Zertifikat und sichere Freigabe kein zentraler produktiver Updateversand.
- Vor einem Stable Release zwingend: reale Leistungs- und Latenzwerte sowie unabhängige Sicherheitsabnahme.
