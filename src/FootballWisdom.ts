/** Own, uncredited football aphorisms. No web requests, media assets or external licenses. */
export const FOOTBALL_WISDOM = [
 'Ein guter Pass beginnt im Kopf, nicht am Fuß.',
 'Wer nur auf den Ball schaut, übersieht das Spiel.',
 'Ein freier Raum ist manchmal wertvoller als ein freier Spieler.',
 'Elf Namen ergeben noch keine Mannschaft.',
 'Der beste Spielzug passt nicht in jede Taktiktafel.',
 'Geduld gewinnt keine Sprintduelle, aber manchmal ganze Spiele.',
 'Wo jemand mitdenkt, muss niemand hinterherlaufen.',
 'Ein Tor ist die Antwort. Die Frage stellt meistens das Mittelfeld.',
 'Wer den Überblick behält, braucht weniger Hektik.',
 'Ein starker Kader beginnt mit guten Entscheidungen.',
 'Die schönste Formation hilft nichts ohne Bewegung.',
 'Nicht jeder Fehlpass ist ein Fehler der Idee.',
 'Auf dem Platz zählt nicht die Lautstärke, sondern der nächste Schritt.',
 'Manchmal ist der klügste Angriff ein Schritt zurück.',
 'Jeder Konter beginnt mit einem richtigen Moment.',
 'Der Unterschied zwischen Risiko und Mut ist oft ein guter Mitspieler.',
 'Wenn alle nach vorne laufen, fehlt hinten jemand mit einem Plan.',
 'Ein perfekter Spielzug braucht oft einen unperfekten ersten Kontakt.',
 'Gute Trainer sehen Möglichkeiten, bevor die Statistik sie kennt.',
 'Das nächste Tor wird nicht im Rückblick geschossen.',
 'Ein ruhiger Aufbau kann ein lautes Stadion auslösen.',
 'Ein Assist steht selten so groß da wie das Tor – und gehört trotzdem dazu.',
 'Wer die Lücke erkennt, hat den ersten Meter schon gewonnen.',
 'Manchmal entscheidet der einfachste Pass die schwierigste Partie.',
 'Ein Team wächst nicht durch Siege allein, sondern durch gemeinsame Antworten.',
 'Der Ball braucht keinen Namen, aber jede Idee braucht jemanden, der mitläuft.',
 'Die beste Halbzeitansprache ist manchmal ein klarer Gedanke.',
 'Der Spielstand erklärt das Ergebnis, nicht immer das Spiel.',
 'Wenn der Plan nicht aufgeht, ist eine neue Idee besser als eine Ausrede.',
 'Die Tabelle zählt Punkte. Ein guter Abend zählt Geschichten.',
 'Ein spätes Tor macht aus fünf Minuten eine ganze Erinnerung.',
 'Kein Trainer gewinnt mit der Aufstellung allein.',
 'Im Football Manager gewinnt man nicht mit Hoffnung, sondern mit dem nächsten Klick.',
 'Ein Transfer ist erst dann gut, wenn er auch ins Team passt.',
 'Die beste Saison beginnt mit dem Mut, die Startelf zu hinterfragen.',
 'Ein gemeinsamer Spielabend braucht keine Verlängerung, nur die richtige Crew.'
] as const;

/** Excludes the previous index and uses constant-time selection. */
export function chooseFootballWisdom(previous:number=-1,random:number=Math.random()):{index:number;text:string}{
 const n=FOOTBALL_WISDOM.length;
 const excluded=Number.isInteger(previous)&&previous>=0&&previous<n?previous:-1;
 const normalized=Number.isFinite(random)?Math.max(0,Math.min(0.9999999999999999,random)):0;
 const offset=Math.floor(normalized*(excluded<0?n:n-1));
 const index=excluded>=0&&offset>=excluded?offset+1:offset;
 return {index,text:FOOTBALL_WISDOM[index]};
}

const STORAGE_KEY='kizuna:last-football-wisdom';
export function startupFootballWisdom(storage?:Pick<Storage,'getItem'|'setItem'>,random:number=Math.random()){
 let previous=-1;
 try{
  const value=storage?.getItem(STORAGE_KEY);
  if(value!==null&&value!==undefined&&/^\d+$/.test(value))previous=Number(value);
 }catch{/* Local storage unavailable; quote still works. */}
 const quote=chooseFootballWisdom(previous,random);
 try{storage?.setItem(STORAGE_KEY,String(quote.index));}catch{/* No extra permissions or network needed. */}
 return quote;
}
