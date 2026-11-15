/** Local Unicode/label reaction catalog. No remotely loaded or proprietary assets. */
export const REACTION_GROUPS=[
 {name:'Fußball',items:['⚽','🥅','🏆','🥇','🟨','🟥','🙌','👏','📣','🎉','🔥','💪','TOR!','VAR!','ELFMETER!']},
 {name:'Klassisch',items:['😀','😂','🤣','😎','😍','🥳','😭','😡','🤔','👍','👎','❤️','👀','🤝','🎮','🚀']}
] as const;
const allowed=new Set<string>(REACTION_GROUPS.flatMap(g=>[...g.items]));
export function isAllowedReaction(value:unknown):value is string{
 return typeof value==='string'&&allowed.has(value);
}
export type StreamReaction={id:string;emoji:string;name:string};
