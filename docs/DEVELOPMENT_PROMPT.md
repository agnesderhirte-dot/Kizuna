# KIZUNA (vormals VoxRally) – fortlaufender Entwicklungsauftrag
Priorität: Jeder Bildschirm, eigener oder fremder, per Doppelklick im Vollbild. Beide Webcams bleiben klein in den Ecken sichtbar und verschiebbar. Die alternative Viereransicht enthält beide Bildschirme und Kameras. Ausgeblendete Streams senden weiter.
Qualität während der Übertragung und im Vollbild einstellen: Bildschirmauflösung, 30/60 FPS, Detail/Bewegung, Bandbreite; Kamera 720/1080p und Bandbreite. Sender stellt seine eigene Qualität ein, tatsächliche Werte anzeigen.
Freunde über direkten voxrally://-Link einladen, Link kopieren/anzeigen, E-Mail-Entwurf im lokalen Mailprogramm. Keine E-Mails ohne explizite Sendeanweisung versenden. App muss beim Empfänger installiert sein; Mailprogramme können eigene Linkschemata blockieren, deshalb Einfügen unterstützen.
Originale Manager-Skins inspiriert von den Jahren 18–27, keine kopierten Spielressourcen. Varianten Classic 18, Club 22, Matchday 24, Portal 27 (Konzept).
Smileys im Chat, eigene Torhymnen/Sounds importieren und bei Freunden abspielen, Zugriff auch im Vollbild. Separate Lautstärken und Ausgabegerät beachten.
Webcam-Hintergründe unabhängig vom App-Hintergrund: Original, weichzeichnen, eigenes Bild. Freistellung ausschließlich lokal, Modelle mitliefern. Keine Kameraaktivität nach Verlassen/Schließen.
Kamera, Mikrofon und Ton praktisch prüfen und echte Hardwaretests von Simulationen unterscheiden. Discord-Installationsdateien nur lesend zur Orientierung, keine Kontodaten oder privaten Chats lesen.
Ressourcen sparen: gezielte Änderungen und Prüfungen, keine Agentenparallelisierung, vorhandene Bibliotheken nutzen. Kameraeffekt nur bei Bedarf laden; Kamera nicht bei jeder Skin-/Bitratenänderung neu öffnen. Neue Bibliothek nur für benötigte lokale Personensegmentierung.
Keine kostenpflichtige Infrastruktur. Online-Signaling über vorhandenen kostenlosen Dienst; NAT kann direkten Verkehr blockieren. Zwei lokale Internet-Signaling-Clients ersetzen keine Abnahme auf zwei getrennten Internetanschlüssen.

Updates: Versionsabgleich im Raum, Hinweis in App und Windows-Benachrichtigung (abhängig von Windows-Fokusregeln). Signierten Installer direkt über separaten P2P-Datenkanal anbieten. Empfänger bestätigt Download und Installation. Kein zusätzlicher Server. Installation erst nach Ed25519-Signatur- und SHA256-Prüfung; keine automatische Ausführung.
Releaseverfahren: Version in package.json erhöhen, vorhandenen privaten Schlüssel build/private/update-key.pem erhalten (niemals veröffentlichen), sign-update.cjs --init vor Build, sign-update.cjs nach Build ausführen. EXE und EXE.update.json gemeinsam im Ordner lassen. Private Schlüssel nicht kopieren/paketieren. APP_VERSION wird automatisch aus package.json erzeugt.
Ab 0.3.0 ist der Updateweg integriert; ältere Installationen müssen einmal manuell aktualisiert werden. Beide Teilnehmer und der anbietende Rechner müssen für P2P-Updates verbunden sein.


## Ergänzung vom 23.11.2026 – dauerhafter Raum, Streaming und Fußball-Sounds

Die folgenden Anforderungen ergänzen den bisherigen Entwicklungsauftrag und haben für die nächste Weiterentwicklung Priorität. Sie sind Arbeitsaufträge, keine Behauptung bereits fertiger Funktionen.

### 1. Direkter Raum und dauerhafte Einladung
- Einen persönlichen, dauerhaft gespeicherten Raum im Raum-Manager anbieten. Raumname, Identität und freigegebene Mitglieder bleiben nach App- und Rechnerneustarts erhalten.
- Den Kollegen einmal per kopierbarem Einladungslink oder per E-Mail-Entwurf einladen. Der Entwurf enthält Raumname, Link und kurze Beitrittsanleitung; der Nutzer versendet ihn selbst. Zusätzlich vollständige Einladung manuell einfügen können.
- Nach Annahme erscheint der Raum dauerhaft beim Kollegen im Raum-Manager. Er kann später direkt wieder beitreten, ohne für jede Sitzung einen neuen Link zu benötigen.
- „Immer Zugriff“ bedeutet dauerhaft berechtigt bis zum Widerruf. Ohne laufenden Gastgeber oder vereinbarte Hosting-Lösung ist ein P2P-Raum nicht ständig erreichbar. Offline-, Verbindungs- und Beitrittsstatus ehrlich anzeigen; bei Wiederverfügbarkeit erneuten Beitritt anbieten.
- Der Gast erhält Zugang zum freigegebenen Raum, keine Verwaltungsrechte über andere Räume oder den Rechner des Gastgebers. Mitglied entfernen, Einladung widerrufen/erneuern und unbefugten Zugriff zuverlässig verhindern. Dauerhafter Zugang darf nicht von einem kurzlebigen Sitzungsschlüssel abhängen.
- Bestehende voxrally://-Links und gespeicherte Nutzerdaten kompatibel behandeln. Einladungsgeheimnisse nicht in Logs, Git oder öffentliche Metadaten schreiben.
- Abnahme: Einladung per Link und Mail-Entwurf, erstmaliger Beitritt auf zweitem Rechner, Neustart beider Apps, Wiederbeitritt ohne neue Einladung sowie Widerruf und Offline-Fall praktisch prüfen.

### 2. Flüssigere Übertragung bei hoher Auflösung
- Nutzerangabe „1040“ vorläufig als 1920 × 1080 (1080p) verstehen; diese Annahme dokumentieren und bei abweichender Rückmeldung anpassen.
- Ziel: flüssige Bildschirmübertragung bei 1080p, möglichst 60 FPS bei geeigneter Hardware und Verbindung; stabiler 30-FPS-Modus als Alternative. Keine pauschale Ruckelfreiheit unabhängig von Upload, Hardware oder Netzqualität versprechen.
- Vor Änderungen einen reproduzierbaren Ausgangstest aufnehmen: tatsächliche Auflösung/FPS, Bitrate, verlorene Frames, Paketverlust, Jitter, RTT sowie CPU-/GPU-Auslastung. Sende-, Netz- und Empfangsengpass unterscheiden.
- Aufnahme, verfügbare Hardwarekodierung, WebRTC-Sendeparameter und Darstellung gezielt optimieren. Unnötige Kopien, Renderdurchläufe und erneutes Öffnen von Aufnahmegeräten vermeiden. Änderungen an Qualität oder Vollbild dürfen laufende Streams nicht unnötig neu starten.
- Bei Überlastung Bitrate, Bildrate oder Auflösung kontrolliert anpassen, ohne ständige Qualitätssprünge. Gewählte und tatsächlich erreichte Qualität sichtbar machen; Sprache und Bedienbarkeit erhalten.
- Abnahme mit zwei Rechnern in getrennten Netzen: mindestens 15 Minuten bewegter Bildschirminhalt, paralleler Sprachchat und Kameras; auch beidseitiges Teilen, Vollbildwechsel und begrenzten Upload testen. Vorher-/Nachher-Werte, Hardware, Netzbedingungen, Standbilder und Audioaussetzer dokumentieren. Lokale Simulationen gesondert kennzeichnen.

### 3. Echte WAV-Dateien für Torjubel und Fußball-Atmosphäre
- Die beanstandete Soundintegration durch hörbar passende, echte PCM-WAV-Audiodateien verbessern. Keine synthetischen Pieptöne als Ersatz für Torjubel und keine lediglich in .wav umbenannten Dateien.
- Eine kleine, stimmige Auswahl vorsehen: Torjubel, Stadionapplaus, Anpfiff/Abpfiff und kurze Fanfare. Nur eigene oder für die Weitergabe in der App freigegebene Aufnahmen verwenden; Herkunft, Lizenz und erforderliche Namensnennung je Datei dokumentieren. Keine fremden Torhymnen oder Spielressourcen ohne passende Rechte mitliefern.
- Dateien im App-Paket mitliefern und offline verfügbar machen. WAV-Inhalt prüfen, Stille sinnvoll kürzen, Pegel angleichen sowie Übersteuerung und hörbare Knackser vermeiden. Größen begrenzen und benötigte Sounds rechtzeitig laden.
- Im Soundboard verständliche Namen, lokale Vorschau, bewusste Wiedergabe im Raum und Stopptaste anbieten. Vorschau darf beim Kollegen nicht erklingen. Eigene WAV-Dateien importieren und ungültige/zu große Dateien verständlich ablehnen.
- Eigene Lautstärke und Stummschaltung für Fußball-Sounds anbieten; Mikrofon, Streamton und Sounds getrennt behandeln und das gewählte Ausgabegerät beachten. Schnelle Mehrfachklicks dürfen weder unkontrolliertes Überlagern noch Überlastung verursachen.
- Sounds auch im Vollbild erreichbar machen. Bei beiden Teilnehmern tatsächlich hörbar testen, ohne doppelte Wiedergabe oder Rückkopplung über den Mikrofonkanal.
- Abnahme: jede mitgelieferte WAV anhören, Vorschau und Raumwiedergabe unterscheiden, Lautstärke/Stoppen/Stummschaltung, Import, Offline-Nutzung und Wiedergabe während 1080p-Streaming prüfen.

### Umsetzung und Übergabe
Die drei Bereiche schrittweise im bestehenden KIZUNA-Projekt umsetzen. Bestehende Funktionen und Nutzerdaten erhalten. Keine zusätzlichen kostenpflichtigen Dienste einführen. Erst nach nachvollziehbaren Prüfungen als fertig melden; offene Hardware-/Zwei-Netze-Tests ausdrücklich offenlassen. Änderungen, Messergebnisse und verbleibende Grenzen in der Übergabe dokumentieren.
