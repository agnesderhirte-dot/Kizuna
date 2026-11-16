# KIZUNA 0.3.2 → 0.4.0: Update innerhalb der bestehenden Anwendung

**Ziel:** Nicht manuell eine neue EXE installieren, sondern in der installierten KIZUNA-Anwendung auf **„Update herunterladen“** und anschließend **„Geprüftes Update installieren“** klicken. Dabei bleiben bestehende Nutzerdaten erhalten. Für die technische Installation benötigt Windows trotzdem ein Update-Paket (intern ein NSIS-`.exe`); der Nutzer soll es **nicht selbst starten**.

## Was bereits funktioniert

- KIZUNA 0.3.2 aus `main` enthält einen **P2P-Updater** mit UI und einem fest hinterlegten **Ed25519-Entwicklerschlüssel** (`desktop/update-public.pem`).
- Dieser öffentliche Schlüssel ist im 0.4.0-Branch **identisch**. Updates müssen mit dem **ursprünglich dazugehörigen privaten Schlüssel** signiert werden.
- GitHub Actions kann ein **nicht öffentlich freigegebenes Test-Update-Paket** mit SHA-256-Prüfsumme erzeugen. Es handelt sich um ein Installationsartefakt, nicht um eine automatische Aktualisierung.
- Die Funktion „Update für Freunde freigeben“ prüft eine benachbarte Datei `KIZUNA-Setup-x64.exe.update.json`, die eine gültige Ed25519-Signatur über Version, Größe und SHA-256 enthält. Nur danach lässt sich das Paket im bestehenden P2P-Raum anbieten.
- Die 0.3.2-Empfänger prüfen die Signatur und den übertragenen Datei-Hash, fragen nach einem **expliziten Installationsklick** und verweigern die Installation bei aktivem Raum/Stream.

## Noch zwingend erforderlich

1. **Ursprünglicher privater Ed25519-Updateschlüssel** auf dem Windows-PC: `build/private/update-key.pem` im lokalen KIZUNA-Projekt. Er ist richtigerweise **nicht auf GitHub**. **Keinen neuen Schlüssel erzeugen**, keine Signaturprüfung umgehen und den privaten Schlüssel **niemals in Chats, Dateienanhänge, GitHub oder CI-Protokolle hochladen**.
2. Ein erfolgreich getestetes aktuelles GitHub-Actions-Artefakt `KIZUNA-0.4.0-x64-UNSIGNED-TEST-ONLY` einschließlich `KIZUNA-Setup-x64.exe` und `KIZUNA-Setup-x64.exe.sha256` auf dem Windows-PC.
3. Ein zweiter, über KIZUNA erreichbarer PC als **P2P-Update-Absender**. Der alte Client kann sich selbst kein Update aus GitHub herunterladen, da der zentrale Kanal in der installierten Version deaktiviert ist. Als Absender genügt auch ein 0.3.2-Client, der das lokal signierte Paket bereitstellt.
4. Die vor dem Upgrade empfohlene unabhängige Datensicherung; die v1→v2-Migration erstellt zusätzlich selbst ein geprüftes SQLite-Backup. Eine echte Windows-Wiederherstellung ist noch offen.

## Signierte Updatebeschreibung lokal erzeugen (ohne Codex)

Die beiden Artefaktdateien liegen beispielsweise nach Entpacken im gleichen Ordner `Downloads\\KizunaUpdate`. Den Entwicklungsbranch lokal auschecken und im Projektverzeichnis bei vorhandenem **ursprünglichem privatem Updateschlüssel** folgenden Befehl ausführen:

`node scripts/prepare-peer-update.cjs "C:\\Users\\<Benutzer>\\Downloads\\KizunaUpdate\\KIZUNA-Setup-x64.exe" "C:\\Users\\<Benutzer>\\Downloads\\KizunaUpdate\\KIZUNA-Setup-x64.exe.sha256"`

Den Beispielpfad durch den tatsächlichen Pfad ersetzen. Das Skript prüft die SHA-256-Prüfsumme gegen das GitHub-Artefakt, signiert die Metadaten **nur auf dem PC**, gleicht die Signatur gegen den bereits installierten öffentlichen Schlüssel ab und erzeugt `KIZUNA-Setup-x64.exe.update.json` im selben Ordner. Es startet und veröffentlicht **nichts** und ersetzt keine bestehenden Dateien.

## Aktualisierung in KIZUNA

1. Beide PCs starten ihre bestehende KIZUNA-Version und verbinden sich im selben privaten Raum.
2. Auf dem **Absender-PC**, der das Updatepaket und die signierte `.update.json` lokal besitzt: **„Update für Freunde freigeben“** wählen und die `KIZUNA-Setup-x64.exe` auswählen. Die Anwendung prüft die Signatur.
3. Auf dem **Empfänger-PC** erscheint das Update 0.4.0; dort auf **„Update 0.4.0 … herunterladen“** klicken. Der Transfer läuft über den bestehenden WebRTC-Datenkanal. Der Empfänger prüft erneut Hash und Entwicklersignatur.
4. Erst nach vollständig geprüfter Übertragung den Raum und alle Streams verlassen. Anschließend den **„Geprüftes Update installieren“**-Knopf betätigen. Das startet das bereits heruntergeladene Installationspaket über KIZUNA selbst, ohne manuelles Suchen/Ausführen einer EXE.
5. Anwendung neu starten, Version 0.4.0, Einstellungen, Bild, Soundbibliothek und Kalender prüfen; Datenbank-Backup kontrollieren.
6. Wenn auch der Absender von 0.3.2 aktualisiert werden soll, muss dieser das Update von einem anderen aktualisierungsbereiten Peer empfangen. Der Quellclient kann ebenfalls in Version 0.3.2 bleiben und ein gültig signiertes Paket anbieten.

**Warnung:** Die von GitHub erzeugten Testpakete sind **nicht Windows-Authenticode-signiert**. Der P2P-Updater prüft stattdessen die bestehende Ed25519-Herausgebersignatur. Eine eventuelle Windows-Warnung darf nicht durch das Abschalten von Sicherheitsmechanismen umgangen werden. Bei fehlender Signatur oder unbekannter Herkunft keine Installation.

## Warum es noch kein „automatisch bei jedem Start“ ist

Der **zentrale** KIZUNA-Updater ist in 0.3.2 und im 0.4.0-Entwicklungsbranch deaktiviert (`desktop/release-channel.json`). Für künftige Updates ohne Mitspieler benötigt KIZUNA einen festgelegten Release-Repository-Kanal, einen vertrauenswürdigen Herausgeber und eine **gültige Windows-Code-Signing-Signatur**. Eine reine GitHub-Veröffentlichung aktiviert diesen Kanal in einer bereits installierten 0.3.2-Version **nicht nachträglich**.

Deshalb: **P2P-Update technisch vorbereitet, aber noch nicht installiert; automatisches GitHub-Selbstupdate ohne zweite KIZUNA-Instanz derzeit nicht verfügbar.** Kein Merge, kein freigegebener Download für Endnutzer und kein zentraler Update-Push ohne Windows-Abnahme und Freigabe.
