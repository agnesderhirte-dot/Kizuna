# KIZUNA – noch ausstehende Windows-/Zwei-PC-Abnahme

Diese Tests wurden **nicht** vom KI-Assistenten auf den beiden physischen PCs durchgeführt. Build- und Unit-Tests sind keine Alternative zur Hardwareabnahme.

## A. Bild und Spielsound
1. Auf zwei Windows-PCs mit unterschiedlichen Internetanschlüssen denselben privaten Raum betreten.
2. Beide Teilnehmer starten gleichzeitig einen Bildschirmstream; Systemaudio auf Wunsch aktivieren.
3. Am Empfangs-PC „Spielsound: [Name]“ stumm stellen und prüfen, dass **nur** sein Spielsound verstummt, seine Sprache und Torhymnen aber hörbar bleiben.
4. Zweiten Bildschirmton unabhängig schalten. Gitter/Fokus/Vollbild wechseln und auf doppelten Ton achten.
5. Lautstärke des Sprachchats, Spielsounds und Soundboards separat verändern. Auch wechselnde Wiedergabegeräte testen.

## B. Tonqualität und Latenz
1. Unter „Sprache & Audio“ den Mikrofontest (3 Sekunden) durchführen. Sprachverständlichkeit, Rauschen, Verzerrung und Aussetzer notieren.
2. Bei Gespräch und laufendem Spielstream WebRTC-Audiowerte sammeln: Jitter, Paketverlust, Audiopuffer, kaschierte Samples und RTT.
3. End-to-End-Verzögerung mit zwei PCs durch kontrollierten akustischen Impuls und getrennte Aufnahme des sendenden/empfangenden Tons messen. WebRTC-Statistiken alleine beweisen keine Ende-zu-Ende-Latenz.
4. Tor-Signal **erstmals** und **erneut** abspielen, Latenzverhalten dokumentieren. Bei großen Sounddateien die anfängliche Übertragungszeit separat erfassen.

## C. Bildqualität
1. 1080p30, 1080p60, 1440p30, 1440p60 mit denselben Spielinhalten testen (Football Manager Text und schnelle Bewegung).
2. Tatsächliche **empfangene** FPS, Frames verworfen, verwendeten Codec, Bitrate, CPU/GPU-Auslastung, Netzwerklatenz und Bildqualität dokumentieren.
3. Beide Teilnehmer streamen gleichzeitig, danach Raum mit 3–4 Teilnehmern testen.
4. Netzwerk kurz unterbrechen und automatische Wiederverbindung prüfen.

## D. Profile, Kalender und Design
1. Foto von jedem Nutzer importieren, Zuschneiden auf 96×96 und Speicherung nach Neustart prüfen.
2. Profiländerungen erst nach „Profil speichern und teilen“ beim Gegenüber prüfen.
3. Alle neun Skins im Vollbild/kleinen Fenster prüfen. Sprecherrahmen bei Stumm/Deafen und mehreren Stimmen testen.
4. Kalendertermin erstellen, wiederholen, Windows-Erinnerung bei geöffnetem Kizuna kontrollieren, ICS in einen Kalender importieren und Sommerzeit prüfen.
5. E-Mail/WhatsApp öffnen: **keine automatische Nachricht**, Nutzer entscheidet selbst über Versand.
6. Favoriten/Emoji-Overlays, Rate-Limits und Original-Sounds im 2-PC-Test prüfen.

## E. Updates / Freigabe
- Bestehenden Installer nicht durch manuelle ungesicherte Dateien ersetzen.
- Signiertes Update inklusive Changelog aus Releasekanal prüfen, Download erst nach Zustimmung, keine Installation während laufender Sitzung.
- Altdaten (SQLite, Profilfoto, eigene Sounds, Kalender) müssen nach Update unverändert erhalten bleiben.
- Code-Signing-Zertifikat und echte Windows-Abnahme fehlen aktuell; keine Veröffentlichung/Produktionsfreigabe.


## F. Neu: Mitspieler-Audio, Effekte, Diagnose und Bibliothek
1. Spielsound von Freund A stumm, Voice A an; Voice-Lautstärke A auf 30 % und Freund B auf 100 % stellen. Prüfen, dass Spielsound und Torhymnen weiterhin unabhängig geregelt werden.
2. Reaktionen von Freund A ausblenden, Reaktionen von B empfangen. Danach Soundboard von A ausblenden und den Ton von B weiterhin hören. UI bei Fokus-/Vollbildansicht prüfen.
3. Während gleichzeitiger 1440p-Übertragung mehrere Minuten die Diagnosewerte protokollieren; einen technischen Report kopieren und **vor Weitergabe auf Teilnehmernamen prüfen**. Es darf keine unbeabsichtigte Übertragung stattfinden.
4. Bei absichtlich verschlechtertem Netz mehrere Messintervalle abwarten und sicherstellen, dass der Qualitätsrat nicht bereits bei einem einzelnen Ausreißer erscheint. FPS eines statischen FM-Bilds alleine darf keine Fehlermeldung auslösen.
5. Sound importieren, entfernen, Löschen abbrechen, Löschen bestätigen; danach prüfen, dass eigene Bilder, Profile und andere Sounds unverändert vorhanden sind.
