/** Local Unicode reactions only: no external emoji packs or copyrighted club assets. */
export const REACTION_GROUPS=[
 {name:'Fußball & Stadion',items:['⚽','🥅','🏆','🥇','🥈','🥉','🟨','🟥','🟦','🏟️','🧤','👟','🎯','📣','🎺','🥁','🚩','📢','⏱️','🎟️','TOR!','VAR!','ELFMETER!','ABSEITS!','MEISTER!','FREISTOSS!']},
 {name:'Jubel & Emotionen',items:['🙌','👏','🎉','🎊','🥳','🔥','💪','🤩','😍','🤗','🤝','🤘','💯','💥','🎆','🎇','💃','🕺','🙈','😱','😤','💔','😢','😭','😡','😠','🤬']},
 {name:'Gesichter',items:['😀','😃','😄','😁','😆','😅','😂','🤣','🙂','🙃','😉','😊','😇','😎','🥸','🤔','🫡','🧐','😴','😵','😬','😶','🤯','😮','😯','🙄','😏','😋','😜','😳']},
 {name:'Gaming & Klassiker',items:['🎮','🕹️','🎲','🎧','🖥️','💻','🚀','⚡','👀','👍','👎','👌','👋','🙏','👑','🧠','💡','⌛','🔔','✅','❌','❤️','💙','💜','🖤','🤍','💚','😺','🐐']}
] as const;
const allowed=new Set<string>(REACTION_GROUPS.flatMap(g=>[...g.items]));
export function isAllowedReaction(value:unknown):value is string{return typeof value==='string'&&allowed.has(value);}
export type StreamReaction={id:string;emoji:string;name:string};
