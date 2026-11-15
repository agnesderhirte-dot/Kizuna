import type {Settings} from './types';
export function StreamQuality({settings,onChange,onApply}:{settings:Settings;onChange:(s:Settings)=>void;onApply:()=>void}){
 return <details className="stream-quality"><summary>Qualität einstellen</summary><div className="quality-popover">
  <strong>Deine Übertragung</strong><p>Die Qualität des fremden Streams stellt dein Freund bei sich ein.</p>
  <label>Bildschirmauflösung<select aria-label="Bildschirmauflösung" value={settings.resolution} onChange={e=>onChange({...settings,resolution:e.target.value as Settings['resolution']})}>{['720','1080','1440','2160','native'].map(v=><option key={v} value={v}>{v==='native'?'Originalauflösung':v+'p'}</option>)}</select></label>
  <label>Bildschirm-FPS<select aria-label="Bildschirm-FPS" value={settings.fps} onChange={e=>onChange({...settings,fps:e.target.value as Settings['fps']})}><option>30</option><option>60</option></select></label>
  <label>Bildschirm Mbit/s<input type="number" min="1" max="80" value={settings.bitrate} onChange={e=>onChange({...settings,bitrate:Number(e.target.value)})}/></label>
  <label>Optimierung<select aria-label="Optimierung" value={settings.profile} onChange={e=>onChange({...settings,profile:e.target.value as Settings['profile']})}><option value="detail">Scharfe Schrift / Manager</option><option value="motion">Flüssige Bewegung</option><option value="auto">Ausgeglichen</option></select></label>
  <label>Webcam-Auflösung<select aria-label="Webcam-Auflösung" value={settings.cameraResolution} onChange={e=>onChange({...settings,cameraResolution:e.target.value as Settings['cameraResolution']})}><option value="720">720p</option><option value="1080">1080p</option></select></label>
  <label>Webcam Mbit/s<input type="number" min="1" max="12" value={settings.cameraBitrate} onChange={e=>onChange({...settings,cameraBitrate:Number(e.target.value)})}/></label>
  <button className="primary" onClick={onApply}>Qualität jetzt anwenden</button><p>Maximalwerte je Empfänger. PC, Kamera und Upload bestimmen das Ergebnis.</p>
 </div></details>;
}
