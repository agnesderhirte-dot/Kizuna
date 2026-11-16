import type {Settings} from './types';

export function ProfilePanel({settings,photo,onChange,onUpload,onSave}:{settings:Settings;photo:string;onChange:<K extends keyof Settings>(field:K,value:Settings[K])=>void;onUpload:()=>void;onSave:()=>void}){
 return <section className="profile-panel" aria-label="Dein Kizuna-Profil">
  <div className="profile-preview">
   <div className="profile-avatar">{photo?<img src={photo} alt="Dein Profilfoto"/>:<span aria-label="Standardavatar">{settings.name.slice(0,2).toUpperCase()}</span>}</div>
   <div><strong>{settings.name||'Spieler'}</strong><small>{settings.favoriteGame||'Spiel auswählen'}</small><p>{settings.profileBio||'Dein Profil für die Gaming-Crew'}</p></div>
  </div>
  <p>Profilfotos werden beim Import lokal auf 96 × 96 Pixel reduziert und ausschließlich an verbundene Teilnehmer übertragen.</p>
  <div className="profile-actions">
   <button type="button" onClick={onUpload}>Profilfoto auswählen</button>
   {settings.profilePhoto&&<button type="button" onClick={()=>onChange('profilePhoto','')}>Profilfoto entfernen</button>}
  </div>
  <label>Spielername<input maxLength={48} value={settings.name} onChange={e=>onChange('name',e.target.value)} required/></label>
  <label>Lieblingsspiel<input maxLength={90} value={settings.favoriteGame} onChange={e=>onChange('favoriteGame',e.target.value)} placeholder="z. B. Football Manager"/></label>
  <label>Profilbeschreibung<textarea rows={3} maxLength={160} value={settings.profileBio} onChange={e=>onChange('profileBio',e.target.value)} placeholder="Kurz etwas über dich"/></label>
  <button className="primary" type="button" onClick={onSave}>Profil speichern und teilen</button>
 </section>;
}
