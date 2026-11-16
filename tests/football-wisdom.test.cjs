const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {loadTs}=require('./load-ts.cjs');
const modulePromise=loadTs('src/FootballWisdom.ts');

test('startup sayings are original, varied and short enough for the app',async()=>{
 const {FOOTBALL_WISDOM}=await modulePromise;
 assert.ok(FOOTBALL_WISDOM.length>=30);
 assert.equal(new Set(FOOTBALL_WISDOM).size,FOOTBALL_WISDOM.length);
 for(const quote of FOOTBALL_WISDOM){
  assert.ok(quote.length>=22&&quote.length<=170);
  assert.ok(!/https?:\/\//i.test(quote));
 }
});

test('each new startup differs from the immediately previous quote',async()=>{
 const {FOOTBALL_WISDOM,startupFootballWisdom,chooseFootballWisdom}=await modulePromise;
 const values=new Map();
 const store={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v)};
 let prior=-1;
 for(let i=0;i<120;i++){
  const q=startupFootballWisdom(store,i%2===0?0:0.999999999999);
  assert.ok(q.index>=0&&q.index<FOOTBALL_WISDOM.length);
  assert.notEqual(q.index,prior);
  assert.equal(q.text,FOOTBALL_WISDOM[q.index]);
  prior=q.index;
 }
 for(let i=0;i<FOOTBALL_WISDOM.length;i++){
  assert.notEqual(chooseFootballWisdom(i,0).index,i);
  assert.notEqual(chooseFootballWisdom(i,.9999999999999).index,i);
 }
});

test('quotes still load when local storage is unavailable or corrupt',async()=>{
 const {startupFootballWisdom}=await modulePromise;
 const broken={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.ok(startupFootballWisdom(broken,.2).text);
 const stale={getItem(){return 'Infinity';},setItem(){}};
 assert.ok(startupFootballWisdom(stale,NaN).text);
});

test('launch UI presents a dismissible, skin-colored banner exactly once per startup',()=>{
 const app=fs.readFileSync(path.join(__dirname,'../src/main.tsx'),'utf8');
 const css=fs.readFileSync(path.join(__dirname,'../src/style.css'),'utf8');
 assert.ok(app.includes('const kickoffWisdom='));
 assert.ok(app.includes('startupFootballWisdom(window.localStorage)'));
 assert.ok(app.includes('showKickoffWisdom&&!room'));
 assert.ok(app.includes('kickoffWisdom.text'));
 assert.ok(app.includes('aria-label="Fußballweisheit schließen"'));
 assert.ok(app.includes('setShowKickoffWisdom(false)'));
 assert.ok(css.includes('.kickoff-wisdom'));
 assert.ok(css.includes('var(--accent)'));
});
