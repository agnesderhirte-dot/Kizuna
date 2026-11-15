import type {Settings} from './types';
type SkinName=Settings['skin'];
const OPTIONS:{id:SkinName;title:string;description:string}[]=[
 {id:'original',title:'KIZUNA Original',description:'Standard · vertraut'},
 {id:'classic18',title:'Classic 18',description:'Graphit · Manager'},
 {id:'purple22',title:'Club 22',description:'Violett · Manager'},
 {id:'matchday24',title:'Matchday 24',description:'Dunkel · Manager'},
 {id:'portal27',title:'Portal 27',description:'Türkis · Manager'},
 {id:'winamp90',title:'Winamp Retro',description:'Metall · Pixel · 1990er'},
 {id:'messenger03',title:'Messenger 2003',description:'Silber · Blau · Oldschool'},
 {id:'neonwave',title:'Neon Wave',description:'Nachtblau · Magenta'},
 {id:'glassmodern',title:'Modern Glass',description:'Minimalistisch · Transparent'}
];
export function SkinPicker({value,onChange}:{value:SkinName;onChange:(value:SkinName)=>void}){
 return <fieldset className="skin-fieldset">
  <legend>Oberfläche / Skin</legend>
  <p className="skin-picker-help">Skin wechseln – Streaming, Hintergründe und Audio bleiben unverändert.</p>
  <div className="skin-gallery">{OPTIONS.map(s=><button key={s.id} type="button" className={`skin-option preview-${s.id}`} aria-pressed={value===s.id} onClick={()=>onChange(s.id)}>
   <span className="skin-preview" aria-hidden="true"><span className="skin-preview-top"><i/><i/><i/></span><span className="skin-preview-content"><i/><i/></span><span className="skin-preview-bottom"/></span>
   <b>{s.title}</b><small>{s.description}</small><span className="skin-selected">{value===s.id?'✓ Aktiv':'Auswählen'}</span>
  </button>)}</div>
 </fieldset>;
}
