/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：shiba-burger-r4/scripts/app-classic.js
 * 役割：R4版しばバーガーの5問の進行、採点、結果画面
 * 利用画面：shiba-burger-r4/index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* old Shiba Burger playable by double-clicking index.html */
const {createSession,orderKey,orderText}=window.ShibaOrders;

const $=id=>document.getElementById(id);
const TOTAL=5;
const customerProfiles=[
  {name:'まいさん',skin:'#f2ba91',hair:'#4a3028',shirt:'#7f9d9c',pants:'#40565e',style:'bob',voice:1.12},
  {name:'たくみさん',skin:'#d6a17e',hair:'#362f2b',shirt:'#b98257',pants:'#4d5c6c',style:'short',voice:.91},
  {name:'ゆいさん',skin:'#efbc9e',hair:'#826045',shirt:'#b98297',pants:'#76636b',style:'long',voice:1.2},
  {name:'けんじさん',skin:'#bb896c',hair:'#d5c2a3',shirt:'#708d66',pants:'#434a44',style:'gray',voice:.81},
  {name:'あおいさん',skin:'#e4b88c',hair:'#202b30',shirt:'#648fbc',pants:'#3c4d64',style:'cap',voice:1.05}
];

let rounds=[],current=-1,points=0,results=[],phase='title',runToken=0,visual=null;
let soundEnabled=true,audioContext=null,challengeTimer=null,resumePhase=null,sessionStartedAt='',bestCombo=0,streakCombo=0;
const $overlays=[$('startOverlay'),$('pauseOverlay'),$('resultOverlay')];

function safeBest(){try{return Number(localStorage.getItem('shiba-burger-best')||0)}catch{return 0}}
function saveBest(value){try{if(value>safeBest())localStorage.setItem('shiba-burger-best',String(value))}catch{}}
function setOverlay(id){for(const item of $overlays)item.classList.toggle('hidden',item.id!==id)}
function clearChallenge(){if(challengeTimer){clearInterval(challengeTimer);challengeTimer=null}}
function cancelVoice(){try{speechSynthesis.cancel()}catch{}}
function schedule(action,ms,token=runToken){setTimeout(()=>{if(token===runToken&&phase!=='paused')action()},ms)}

function sound(type='click'){
  if(!soundEnabled)return;
  if(window.KotobaSharedSFX)window.KotobaSharedSFX.play(type==='door'?'start':type);
}

function speakOrder(force=false){
  if(!soundEnabled||(!force&&!$('autoVoice').checked)||phase!=='ordering'||!('speechSynthesis'in window))return;
  cancelVoice();
  try{const utterance=new SpeechSynthesisUtterance(rounds[current].speech);utterance.lang='ja-JP';utterance.rate=.91;utterance.pitch=customerProfiles[current].voice;utterance.volume=window.KotobaSharedSFX?window.KotobaSharedSFX.voiceLevel():.6;if(utterance.volume<=0)return;
    const japanese=speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase().startsWith('ja'));
    if(japanese)utterance.voice=japanese;speechSynthesis.speak(utterance);
  }catch(e){/* Written text remains visible. */}
}

function avatarSvg(profile,happy=false,angry=false){
  const eyebrow=angry?'<path d="M108 128l21 12 M171 140l21-12" stroke="#4e2b22" stroke-width="6" stroke-linecap="round"/>':'<path d="M108 136l20-3 M174 133l20 3" stroke="#6d4637" stroke-width="4" stroke-linecap="round"/>';
  const mouth=angry?'<path d="M133 188Q150 172 169 188" fill="none" stroke="#7e3e37" stroke-width="5" stroke-linecap="round"/>':happy?'<path d="M129 178Q150 199 171 178" fill="none" stroke="#9a5149" stroke-width="6" stroke-linecap="round"/>':'<path d="M137 184Q150 191 163 184" fill="none" stroke="#995d4e" stroke-width="4" stroke-linecap="round"/>';
  let hair='';
  if(profile.style==='bob')hair='<path d="M91 148Q75 75 137 65Q211 59 214 140L213 173Q205 181 194 169L191 119L106 119L108 171Q90 180 86 164Z" fill="'+profile.hair+'"/>';
  else if(profile.style==='long')hair='<path d="M86 137Q65 66 144 59Q220 57 218 143L225 234L193 233L190 123L108 124L106 233L75 232Z" fill="'+profile.hair+'"/>';
  else if(profile.style==='cap')hair='<path d="M88 122Q83 70 151 71Q213 72 213 123L203 148L101 146Z" fill="'+profile.hair+'"/><path d="M84 97Q101 53 149 60Q199 55 218 99L233 116Q200 132 89 117Z" fill="#2e6358"/><path d="M86 113Q168 95 226 111" fill="none" stroke="#255047" stroke-width="9" stroke-linecap="round"/>';
  else if(profile.style==='gray')hair='<path d="M92 131Q83 70 151 66Q216 74 210 132Q185 106 165 109Q117 115 94 143Z" fill="'+profile.hair+'"/>';
  else hair='<path d="M88 127Q82 72 145 69Q213 69 213 126Q191 107 173 112Q117 114 96 144Z" fill="'+profile.hair+'"/>';
  const skin=profile.skin,shirt=profile.shirt,inner=angry?'#cf6b61':shirt;
  return `<svg viewBox="0 0 300 365" role="img" aria-label="${profile.name}${angry?'が怒っています':happy?'が喜んでいます':'が注文しています'}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${inner}"/><stop offset="1" stop-color="#344f4b"/></linearGradient><radialGradient id="skin"><stop stop-color="#ffe1b8"/><stop offset="1" stop-color="${skin}"/></radialGradient></defs>
  <ellipse cx="152" cy="347" rx="109" ry="16" fill="#071a0e40"/>
  <path d="M81 259Q82 218 116 216L184 216Q222 218 229 260L247 347L51 347Z" fill="url(#coat)" stroke="#274e4566" stroke-width="4"/>
  <path d="M113 340L108 268M196 268L199 342" stroke="#2e5048" stroke-width="5" opacity=".3"/>
  <rect x="120" y="206" width="61" height="43" rx="17" fill="${skin}"/>
  <ellipse cx="150" cy="144" rx="67" ry="81" fill="url(#skin)" stroke="#aa73504a" stroke-width="2"/>
  <ellipse cx="84" cy="149" rx="11" ry="23" fill="${skin}"/><ellipse cx="216" cy="149" rx="11" ry="23" fill="${skin}"/>
  ${hair}
  <ellipse cx="124" cy="151" rx="7" ry="10" fill="#34322d"/><ellipse cx="178" cy="151" rx="7" ry="10" fill="#34322d"/>
  <circle cx="126" cy="147" r="2.3" fill="#fff"/><circle cx="180" cy="147" r="2.3" fill="#fff"/>
  ${eyebrow}${mouth}
  <ellipse cx="108" cy="174" rx="13" ry="5" fill="#e8947b" opacity=".29"/><ellipse cx="190" cy="174" rx="13" ry="5" fill="#e8947b" opacity=".29"/>
  <path d="M100 249Q50 254 34 312" fill="none" stroke="${inner}" stroke-width="29" stroke-linecap="round"/>
  <path d="M200 249Q248 259 262 310" fill="none" stroke="${inner}" stroke-width="29" stroke-linecap="round"/>
  <circle cx="33" cy="312" r="15" fill="${skin}"/><circle cx="262" cy="310" r="15" fill="${skin}"/>
  ${angry?'<path d="M238 115l20-27M251 121l31-7" stroke="#ed5449" stroke-width="7" stroke-linecap="round"/>':''}
  </svg>`;
}

function fallbackEnter(profile){
  const el=$('fallbackCustomer');el.className='fallback-customer';el.innerHTML=avatarSvg(profile);
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('enter')));
}
function fallbackReact(correct){const el=$('fallbackCustomer');const profile=customerProfiles[current];el.innerHTML=avatarSvg(profile,correct,!correct);el.classList.add(correct?'happy':'angry')}
function fallbackExit(){const el=$('fallbackCustomer');el.className='fallback-customer exit';}

function showCustomerBadge(text){$('customerLabel').textContent=text;$('customerBadge').classList.add('visible')}
function hideCustomerBadge(){$('customerBadge').classList.remove('visible')}
function resetPanels(){
  $('orderBubble').classList.remove('show');$('thinkMessage').classList.remove('show');$('answerPanel').classList.remove('show');$('reaction').className='reaction';
}
function updateHud(){
  $('score').textContent=String(points).padStart(3,'0');$('roundNumber').textContent=`${Math.min(current+1,5)} / 5`;
  $('progressDots').innerHTML=Array.from({length:TOTAL},(_,i)=>{
    let status='';if(i<results.length)status=results[i].correct?'done':'wrong';else if(i===current)status='current';
    return `<span class="dot ${status}" aria-label="${i+1}問目${status==='done'?'正解':status==='wrong'?'不正解':''}"></span>`;
  }).join('');
}

// 【startGame】R4版の注文記憶ゲームを最初から開始します。全5問の結果を記録します。
function startGame(){
  runToken++;clearChallenge();cancelVoice();rounds=createSession(Date.now()+Math.floor(Math.random()*1000));
  current=-1;points=0;results=[];bestCombo=0;streakCombo=0;sessionStartedAt=new Date().toISOString();phase='entering';setOverlay(null);resetPanels();visual?.reset?.();sound('door');
  try{window.KotobaShibaBurgerIntegration?.begin()}catch(e){console.warn('学習開始の連携は省略します',e)}
  startRound(0);
}
// 【startRound】お客様1人分の来店・注文シーンへ移ります。
function startRound(index){
  clearChallenge();cancelVoice();current=index;phase='entering';const token=++runToken;
  resetPanels();updateHud();
  if(index>=TOTAL){finishGame();return}
  const profile=customerProfiles[index];showCustomerBadge(`お客様 ${index+1} / ${TOTAL}　${profile.name}`);
  fallbackEnter(profile);visual?.enterCustomer?.(profile,index);
  sound('door');schedule(showOrder,1150,token);
}
// 【showOrder】注文内容を表示・読み上げし、記憶の時間を設けます。
function showOrder(){
  if(current<0||current>=TOTAL)return;
  phase='ordering';$('orderText').textContent=`「${rounds[current].speech}」`;
  $('orderBubble').classList.add('show');$('rememberButton').disabled=false;
  $('rememberButton').innerHTML='覚えた！ 注文を確認 <span aria-hidden="true">→</span>';
  speakOrder();
  if($('challengeMode').checked){
    const started=performance.now(),token=runToken;
    challengeTimer=setInterval(()=>{
      if(token!==runToken||phase!=='ordering'){clearChallenge();return}
      const seconds=Math.max(0,Math.ceil((8000-(performance.now()-started))/1000));
      $('rememberButton').textContent=`注文を確認 → あと${seconds}秒`;
      if(seconds===0){clearChallenge();beginRecall()}
    },130);
  }
}
function beginRecall(){
  if(phase!=='ordering')return;
  clearChallenge();cancelVoice();phase='thinking';$('orderBubble').classList.remove('show');
  $('thinkMessage').classList.add('show');sound('click');
  const token=runToken;schedule(()=>{$('thinkMessage').classList.remove('show');showAnswers()},1050,token);
}
function foodMarkup(order){
  const extras=[];if(order.side)extras.push(order.side.icon);if(order.drink)extras.push(order.drink.icon);
  return `<span class="answer-food" style="background:radial-gradient(circle at 38% 29%,#fff3ca,${order.burger.accent}77)"><span class="food-burger" aria-hidden="true">🍔</span><span class="food-extras" aria-hidden="true">${extras.join('')}</span></span>`;
}
// 【showAnswers】注文を覚えたか確かめる4択を表示します。
function showAnswers(){
  phase='choosing';const q=rounds[current];const grid=$('answerGrid');
  grid.innerHTML=q.choices.map((o,i)=>{
    const extras=[o.side?.name,o.drink?.name].filter(Boolean).join(' ＋ ');
    return `<button type="button" class="answer-card" data-answer="${i}" aria-label="${i+1}番、${orderText(o)}">
      ${foodMarkup(o)}<span class="answer-description"><strong>${o.burger.name}</strong>${extras?`<span>${extras}</span>`:'<span>単品</span>'}</span><span class="option-letter">${i+1}</span></button>`;
  }).join('');
  $('answerLevel').textContent=`LEVEL ${current+1}`;
  $('answerPanel').classList.add('show');
  grid.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>answer(Number(button.dataset.answer))));
}
// 【answer】4択の回答を採点し、正誤リアクションにつなぎます。
function answer(selected){
  if(phase!=='choosing'||selected<0||selected>3)return;
  phase='reaction';const q=rounds[current],correct=selected===q.correctIndex;
  const buttons=[...$('answerGrid').querySelectorAll('button')];
  buttons.forEach((button,index)=>{button.disabled=true;if(index===q.correctIndex)button.classList.add('correct');if(index===selected&&!correct)button.classList.add('wrong');if(index===selected)button.insertAdjacentHTML('beforeend',`<span class="result-mark">${correct?'✅':'❌'}</span>`)});
  if(correct){points+=100;streakCombo++;bestCombo=Math.max(bestCombo,streakCombo)}else{streakCombo=0}
  const questionText=`${customerProfiles[current].name}の注文を思い出しましょう。`;
  const correctText=orderText(q.order),selectedText=orderText(q.choices[selected]);
  const detail={index:current,correct,correctText,selectedText,prompt:questionText,right:correctText,selected:selectedText,
    success:correct,explain:`注文は「${correctText}」でした。注文の品物を一つずつ確認しましょう。`,wrongAttempts:correct?0:1,usedHint:false};
  results.push(detail);
  try{window.KotobaShibaBurgerIntegration?.answer(detail,correct,selectedText)}catch(e){console.warn('学習回答の連携は省略します',e)}
  updateHud();sound(correct?'correct':'wrong');
  const reaction=$('reaction');reaction.className=`reaction ${correct?'correct':'wrong'} show`;
  $('reactionIcon').textContent=correct?'✨':'💢';
  $('reactionTitle').textContent=correct?'ピッタリ！ 大正解！':'注文が違うよ！';
  $('reactionDetail').textContent=correct?'「ありがとう！ また来るね！」':'「もういいです！ 帰ります！」';
  visual?.react?.(correct);fallbackReact(correct);
  const spark=$('sceneSpark');spark.textContent=correct?'✨':'💢';spark.classList.add('pop');
  const token=runToken;
  schedule(()=>{
    $('answerPanel').classList.remove('show');reaction.classList.remove('show');spark.classList.remove('pop');
    phase='leaving';visual?.exitCustomer?.(correct);fallbackExit();hideCustomerBadge();
    schedule(()=>{if(current+1<TOTAL)startRound(current+1);else finishGame()},1050,token);
  },2000,token);
}

// 【finishGame】5問終了時の結果表示と本体の記録・メダル連携を行います。
function finishGame(){
  clearChallenge();cancelVoice();runToken++;phase='results';resetPanels();hideCustomerBadge();
  const count=results.filter(x=>x.correct).length,rate=Math.round(count/TOTAL*100);
  saveBest(points);$('startBest').textContent=safeBest();
  // The original R4 result UI is preserved. Write the same session once into
  // KotobaQuest's existing profile, mastery, medals and question-result store.
  try{
    const award=window.KotobaShibaBurgerIntegration?.finish({startedAt:sessionStartedAt,score:count,total:TOTAL,
      answers:results,bestCombo})||null;
    const reward=$('questReward');
    if(reward){
      reward.textContent=award?`🌸 最大連続正解 ${bestCombo}回 ／ メダル +${award.medals}枚 ／ 学習記録：${award.recordSaved?'保存済み':'保存できませんでした'}`:
       '🌸 単独のしばバーガーとして遊べます。学習記録の連携は利用できません。';
      reward.classList.toggle('is-warning',!award?.recordSaved);
    }
  }catch(e){console.warn('学習結果の連携は省略します',e);const reward=$('questReward');if(reward){reward.textContent='学習記録を保存できませんでした。';reward.classList.add('is-warning')}}
  $('resultCorrect').innerHTML=`${count}<span>/5</span>`;$('resultRate').textContent=`${rate}%`;$('resultPoints').textContent=String(points);
  let grade='';
  if(count===5){grade='伝説のしばバーガー店長！';$('resultMedal').textContent='🏆';sound('finish')}
  else if(count>=3){grade='いい調子！ 人気店長まであと少し';$('resultMedal').textContent='🥇'}
  else{grade='練習すればきっと上達するよ！';$('resultMedal').textContent='🐾'}
  $('resultGrade').textContent=grade;
  $('resultList').innerHTML=results.map((r,i)=>`<div class="result-row ${r.correct?'good':'bad'}">
    <span class="result-symbol">${r.correct?'✅':'❌'}</span><div class="result-copy"><strong>第${i+1}問　${r.correct?'ご注文どおり！':'注文を間違えました'}</strong>
    <small>正しい注文：${r.correctText}${r.correct?'':`<br>選んだ注文：${r.selectedText}`}</small></div><b>${r.correct?'+100':'0'} pt</b></div>`).join('');
  setOverlay('resultOverlay');
}

function toggleAudio(){soundEnabled=!soundEnabled;$('audioToggle').textContent=soundEnabled?'🔊':'🔇';$('audioToggle').setAttribute('aria-label',soundEnabled?'音声をオフにする':'音声をオンにする');if(!soundEnabled)cancelVoice();else sound('click')}
function pauseGame(){if(!['entering','ordering','thinking','choosing'].includes(phase))return;resumePhase=phase;phase='paused';runToken++;clearChallenge();cancelVoice();setOverlay('pauseOverlay')}
function resumeGame(){if(phase!=='paused')return;setOverlay(null);const was=resumePhase;resumePhase=null;phase=was;
  if(was==='entering'){startRound(current)}
  else if(was==='ordering'){showOrder()}
  else if(was==='thinking'){$('thinkMessage').classList.remove('show');showAnswers()}
  else if(was==='choosing'){$('answerPanel').classList.add('show')}
}
function backToTitle(){runToken++;phase='title';clearChallenge();cancelVoice();setOverlay('startOverlay');resetPanels();hideCustomerBadge();$('fallbackCustomer').className='fallback-customer';visual?.reset?.();$('startBest').textContent=safeBest()}

function bindControls(){
  $('startButton').addEventListener('click',startGame);$('retryButton').addEventListener('click',startGame);$('backTitleButton').addEventListener('click',backToTitle);
  $('rememberButton').addEventListener('click',beginRecall);$('replayButton').addEventListener('click',()=>{if(phase==='ordering')speakOrder(true)});
  $('audioToggle').addEventListener('click',toggleAudio);$('pauseButton').addEventListener('click',()=>phase==='paused'?resumeGame():pauseGame());
  $('resumeButton').addEventListener('click',resumeGame);$('pauseQuitButton').addEventListener('click',backToTitle);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if(phase==='paused')resumeGame();else pauseGame();return}
    if(phase==='choosing'&&['1','2','3','4'].includes(e.key)){e.preventDefault();answer(Number(e.key)-1)}
    if(phase==='ordering'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();beginRecall()}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});
}

async function initVisual(){
  try{
    const module={createBurgerScene:window.ShibaCreateBurgerScene};
    visual=await module.createBurgerScene($('threeHost'));
    document.body.classList.add('using3d');
    if(current>=0&&current<TOTAL&&['entering','ordering','thinking','choosing','reaction'].includes(phase))visual.enterCustomer(customerProfiles[current],current);
  }catch(error){console.warn('WebGLが利用できないため、イラスト表示で続行します。',error);document.body.classList.remove('using3d')}
}

$('startBest').textContent=safeBest();
bindControls();window.ShibaGameReady=true;updateHud();
initVisual(); // 3D読み込みに失敗しても注文クイズはすべて遊べます。
