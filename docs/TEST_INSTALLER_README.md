# KIZUNA 0.4.0 – NICHT SIGNIERTER WINDOWS-TESTINSTALLER

Dieser Installer dient ausschließlich dem **kontrollierten, lokalen Funktionstest**. Er ist kein offizielles Update und noch **nicht** für die Verteilung an andere Nutzer freigegeben.

## Herkunft und Integrität
- Repository: https://github.com/agnesderhirte-dot/Kizuna
- Branch: `feat/retro-modern-skins`, Draft-Pull-Request #1
- GitHub-Actions-Lauf: im Dateianhang des jeweiligen Durchlaufs ablesbar
- Dateiname: `KIZUNA-Setup-x64.exe`
- Der zugehörige `KIZUNA-Setup-x64.exe.sha256`-Anhang enthält den SHA-256-Wert. Vor Installation lokal mit `Get-FileHash .\\KIZUNA-Setup-x64.exe -Algorithm SHA256` vergleichen.
- Der Testinstaller besitzt **keine produktive Authenticode-Signatur**; Windows kann deshalb eine unbekannte Anwendung melden. Windows-Sicherheitsmechanismen **nicht deaktivieren oder umgehen**. Bei Zweifeln den Test abbrechen.

## Vor dem Start
1. Vollständig schließbare aktuelle KIZUNA-/VoxRally-Installation sicherstellen.
2. Bestehende Daten in `%APPDATA%\\VoxRally` bei beendeter Anwendung sichern (insbesondere `voxrally.sqlite` und mögliche `-wal`-/`-shm`-Dateien). Auf echte private Daten achten, niemals in öffentliche Logs/Artefakte laden.
3. Nach Möglichkeit zunächst auf einer getrennten Windows-Testinstallation oder einem unkritischen Profil testen. Keine produktive Installation überschreiben.
4. Die neue SQLite-Migration legt vor der ersten Version-1→2-Umstellung automatisch `voxrally.sqlite.pre-0.4.0-backup` an. Dieses Backup ersetzt nicht die oben empfohlene unabhängige Sicherung.
5. Installations-, Funktions- und Audio-Tests gemäß `docs/WINDOWS_HANDOFF.md` und `docs/HARDWARE_ACCEPTANCE.md` durchführen.

## Noch keine Veröffentlichung
- Keine Änderung an `main`, kein GitHub-Release und kein automatisches Update an bestehende Nutzer.
- Zentrale Updates bleiben deaktiviert, bis Windows-Publisher-Identität, Zertifikat, Datenmigration und echte Zwei-PC-/1440p60-/Audiotests bestätigt sind.
- Das Bestehen automatisierter GitHub-Windows-Tests ersetzt **nicht** den Test mit zwei echten PCs.
