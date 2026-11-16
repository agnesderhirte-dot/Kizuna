/** Self-contained, copy-only report with explicitly whitelisted values. */
type DiagnosticConfig={resolution:string;fps:string;profile:string;bitrate:number};
function clean(value:string):string{
 return value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,220);
}
export function buildDiagnosticReport(version:string,settings:DiagnosticConfig,lines:readonly string[],when=Date.now()):string{
 const header=[
  'KIZUNA – Technische Verbindungsdiagnose',
  'Zeit (UTC): '+new Date(when).toISOString(),
  'Version: '+clean(version),
  'Angeforderte Auflösung: '+clean(settings.resolution),
  'Angeforderte FPS: '+clean(settings.fps),
  'Streaming-Profil: '+clean(settings.profile),
  'Bitraten-Limit pro Peer: '+(Number.isFinite(settings.bitrate)?Math.max(0,settings.bitrate):'?')+' Mbit/s',
  '',
  'WebRTC-Empfangs- und Sendedaten:'
 ];
 const measurements=lines.slice(0,60).map(clean).filter(Boolean);
 if(!measurements.length)measurements.push('Noch keine Messwerte vorhanden. Zum Messen aktiv mit einem Freund verbinden.');
 return [...header,...measurements,'','Hinweis: Teilnehmernamen können enthalten sein. Vor Weitergabe prüfen. Keine Chat-, Einladungs-, Bild- oder Toninhalte automatisch beigefügt.'].join('\n').slice(0,11000);
}
