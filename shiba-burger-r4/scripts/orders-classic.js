/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：shiba-burger-r4/scripts/orders-classic.js
 * 役割：R4版しばバーガーの注文・4択の出題データ
 * 利用画面：shiba-burger-r4/index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* offline compatible original order data */
(function(){
// しばバーガー：注文記憶クイズの純粋なデータ・出題ロジック
// 5ラウンド固定。各ラウンドの正解は常に4択の中に1つだけ。

const BURGERS = [
  {id:'cheese',name:'チーズバーガー',accent:'#ffca61'},
  {id:'teriyaki',name:'てりやきバーガー',accent:'#bb7448'},
  {id:'double',name:'ダブルバーガー',accent:'#b85b42'},
  {id:'fish',name:'フィッシュバーガー',accent:'#8cbac5'},
  {id:'chicken',name:'チキンバーガー',accent:'#e9a35b'},
  {id:'bacon',name:'ベーコンバーガー',accent:'#d98276'},
  {id:'avocado',name:'アボカドバーガー',accent:'#a7bb65'}
];
const SIDES = [
  {id:'fries_s',name:'ポテトS',icon:'🍟'},
  {id:'fries_m',name:'ポテトM',icon:'🍟'},
  {id:'fries_l',name:'ポテトL',icon:'🍟'},
  {id:'nuggets',name:'ナゲット',icon:'🍗'},
  {id:'onion',name:'オニオンリング',icon:'🧅'}
];
const DRINKS = [
  {id:'cola',name:'コーラ',icon:'🥤'},
  {id:'orange',name:'オレンジジュース',icon:'🍊'},
  {id:'tea',name:'アイスティー',icon:'🧋'},
  {id:'lemon',name:'レモネード',icon:'🍋'},
  {id:'coffee',name:'アイスコーヒー',icon:'☕'}
];

function seededRandom(seed){
  let s=(Number(seed)>>>0)||1;
  return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296};
}
function shuffled(items,rng){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
  return result;
}
const orderKey=o=>[o.burger?.id||'-',o.side?.id||'-',o.drink?.id||'-'].join('/');

function orderText(o){
  return [o.burger?.name,o.side?.name,o.drink?.name].filter(Boolean).join(' ＋ ');
}
function orderSpeech(o){
  if(!o.side&&!o.drink)return `${o.burger.name}をひとつお願いします！`;
  if(!o.side)return `${o.burger.name}と、${o.drink.name}をください！`;
  if(!o.drink)return `${o.burger.name}と、${o.side.name}をお願いします！`;
  return `${o.burger.name}に${o.side.name}、飲み物は${o.drink.name}でお願いします！`;
}

function createSession(seed=Date.now()){
  const rng=seededRandom(seed);
  const burgers=shuffled(BURGERS,rng);
  const sides=shuffled(SIDES,rng);
  const drinks=shuffled(DRINKS,rng);
  const shapes=['burger','burger_drink','burger_side','set','set'];
  return shapes.map((shape,index)=>{
    const order={burger:burgers[index],side:shape==='burger_side'||shape==='set'?sides[index]:null,
      drink:shape==='burger_drink'||shape==='set'?drinks[index]:null};
    const choices=makeChoices(order,seed+index*1097+712);
    return {index,shape,order,choices,correctIndex:choices.findIndex(c=>orderKey(c)===orderKey(order)),speech:orderSpeech(order)};
  });
}

function makeChoices(order,seed=1){
  const rng=seededRandom(seed),options=[order],seen=new Set([orderKey(order)]);
  const add=(replacement)=>{const candidate={...order,...replacement},id=orderKey(candidate);if(!seen.has(id)){seen.add(id);options.push(candidate)}};
  const otherBurgers=shuffled(BURGERS.filter(x=>x.id!==order.burger.id),rng);
  const otherSides=order.side?shuffled(SIDES.filter(x=>x.id!==order.side.id),rng):[];
  const otherDrinks=order.drink?shuffled(DRINKS.filter(x=>x.id!==order.drink.id),rng):[];
  if(order.side&&order.drink){
    add({burger:otherBurgers[0]});add({side:otherSides[0]});add({drink:otherDrinks[0]});
  }else if(order.side){
    add({burger:otherBurgers[0]});add({side:otherSides[0]});add({side:otherSides[1]});
  }else if(order.drink){
    add({burger:otherBurgers[0]});add({drink:otherDrinks[0]});add({drink:otherDrinks[1]});
  }else{
    for(let i=0;i<3;i++)add({burger:otherBurgers[i]});
  }
  if(options.length!==4)throw new Error('4択を生成できませんでした');
  return shuffled(options,rng);
}

window.ShibaOrders={createSession,orderKey,orderText,orderSpeech,makeChoices};
})();
