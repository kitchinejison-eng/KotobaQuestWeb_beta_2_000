/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/games/cat-word-puzzle.js
 * 役割：文字をなぞる猫パズルのゲーム本体
 * 利用画面：cat-word-puzzle.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA29 — 猫のことばパズル。隣接文字をなぞり、正解を消して新しい文字を落とす。
 * 3D描画は独立モジュール。WebGLが使えなくても問題は続けられます。
 * 解答結果は cat-word-puzzle-integration.js 経由で保存します。
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const WORDS = [
    [1,'ねこ','🐈','にゃあと鳴く、ひげのある動物','猫は、ひげで周りの様子を感じます。'],
    [1,'いぬ','🐕','わんわんと鳴く、身近な動物','犬は人と暮らすことが多い動物です。'],
    [1,'とり','🐦','羽があり、空を飛ぶ仲間','鳥には羽があり、空を飛べる種類がいます。'],
    [1,'さる','🐒','木に登るのが得意な動物','猿は木登りが得意な種類が多い動物です。'],
    [1,'くま','🐻','体が大きく、森にいる動物','熊は森などに暮らす動物です。'],
    [1,'うし','🐄','牧場で飼われ、牛乳を出す動物','牛の乳から牛乳が作られます。'],
    [1,'うま','🐎','人を乗せて走ることがある動物','馬は走るのが得意な動物です。'],
    [1,'かめ','🐢','背中に硬い甲羅がある動物','亀は甲羅で体を守ります。'],
    [1,'かさ','☂️','雨の日にさして使うもの','傘は雨や日差しを防ぐ道具です。'],
    [1,'くつ','👟','外を歩くときに足にはくもの','靴は足を守ります。'],
    [1,'はな','🌼','庭に咲き、色や香りを楽しむもの','花にはいろいろな色や形があります。'],
    [1,'ほし','⭐','夜の空で光って見えるもの','星は遠くにある天体です。'],
    [1,'そら','🌤️','雲や太陽が見える、頭の上の広がり','空には雲や太陽が見えます。'],
    [1,'つき','🌙','夜の空に見える、丸くなったり細く見えたりするもの','月の形の見え方は日ごとに変わります。'],
    [1,'やま','⛰️','地面が高く盛り上がった場所','山には木や草が生えていることがあります。'],
    [1,'うみ','🌊','広くて塩辛い水のある場所','海の水には塩分が含まれています。'],
    [1,'かわ','🏞️','山から町へと水が流れる場所','川の水は高い場所から低い場所へ流れます。'],
    [1,'みず','💧','飲んだり洗ったりするときに使う液体','水は暮らしに欠かせません。'],
    [1,'あめ','🌧️','空の雲から落ちてくる水','雨は雲の中の水滴などから生じます。'],
    [1,'ゆき','❄️','冬に空から降る白いもの','雪は氷の結晶が集まったものです。'],
    [1,'かぎ','🔑','ドアや箱を開けるときに使うもの','鍵は扉などを開け閉めする道具です。'],
    [2,'さかな','🐟','海や川で泳ぐ生き物','魚は水の中で暮らします。'],
    [2,'りんご','🍎','赤い種類もある、丸い果物','りんごは果物の一つです。'],
    [2,'みかん','🍊','皮をむいて食べるオレンジ色の果物','みかんは房に分かれています。'],
    [2,'ばなな','🍌','黄色い皮をむいて食べる果物','バナナは柔らかく甘い果物です。'],
    [2,'いちご','🍓','赤くて小さい、粒のある果物','いちごは春に多く出回ります。'],
    [2,'すいか','🍉','夏に食べる、緑の皮と赤い実の果物','すいかには水分が多く含まれます。'],
    [2,'とまと','🍅','赤くて丸い、サラダでも食べる野菜','トマトは赤い実が特徴です。'],
    [2,'たまご','🥚','鳥が産む、料理でよく使う食品','卵はさまざまな料理に使われます。'],
    [2,'ぱんだ','🐼','白と黒の模様がある動物','パンダは竹をよく食べます。'],
    [2,'きつね','🦊','とがった耳とふさふさの尾を持つ動物','狐は森や野原に暮らします。'],
    [3,'でんわ','☎️','離れた人と声で話す道具','電話は遠くの人と話すために使います。'],
    [3,'てがみ','✉️','紙に書いて相手へ送る文章','手紙では気持ちや用件を伝えられます。'],
    [3,'えんぴつ','✏️','紙に文字を書き、消すこともできる文房具','鉛筆は芯を使って文字を書きます。'],
    [3,'つくえ','🪑','勉強や仕事のときに物を置く台','机の上で文字を書いたり作業したりします。'],
    [3,'くるま','🚗','道路を走る、タイヤのついた乗り物','車は道路を走る乗り物です。'],
    [3,'じてんしゃ','🚲','ペダルをこいで進む二輪の乗り物','自転車はペダルをこいで進みます。'],
    [3,'けしごむ','🧽','鉛筆で書いた文字を消す文房具','消しゴムは鉛筆の字を消すときに使います。'],
    [3,'とけい','🕒','今の時刻を確認するもの','時計は時刻を知らせます。'],
    [3,'かばん','👜','物を入れて持ち歩く袋','かばんには持ち物を入れます。'],
    [3,'めがね','👓','目の前にかけ、見え方を助ける道具','眼鏡は視力の補助に使います。'],
    [4,'しんぶん','📰','毎日のニュースなどが印刷された紙','新聞にはニュースが載っています。'],
    [4,'としょかん','📚','本を借りたり読んだりできる施設','図書館には多くの本があります。'],
    [4,'ようふく','👕','外出するときなどに着るもの','洋服にはいろいろな形があります。'],
    [4,'こうえん','🌳','遊具やベンチがある屋外の場所','公園は散歩や遊びに利用できます。'],
    [4,'びょういん','🏥','病気やけがを診てもらう場所','病院では診察や治療を受けられます。'],
    [4,'たいよう','☀️','昼の空に見える、明るい天体','太陽は地球に光と熱を届けます。'],
    [4,'はみがき','🪥','歯ブラシを使って歯をきれいにすること','歯磨きは歯の汚れを落とします。'],
    [4,'かいだん','🪜','上の階と下の階をつなぐ段','階段は段を上り下りします。'],
    [4,'おんがく','🎵','音やリズムを楽しむもの','音楽にはさまざまな種類があります。'],
    [4,'おふろ','🛁','体を洗ったり温まったりする場所','お風呂では体を洗うことができます。'],
    [5,'ひまわり','🌻','夏に大きな黄色い花を咲かせる植物','ひまわりには黄色い花びらがあります。'],
    [5,'なつやすみ','🏖️','夏の学校などにある長いお休み','夏休みには学校の授業が休みになることがあります。'],
    [5,'あさごはん','🍳','朝に食べる食事','朝ごはんは朝に食べる食事です。'],
    [5,'ひこうき','✈️','空を飛んで人を運ぶ乗り物','飛行機は空を飛ぶ交通手段です。'],
    [5,'れいぞうこ','🧊','食べ物や飲み物を冷やして保存する家電','冷蔵庫は食品を冷やして保存します。'],
    [5,'おとうと','👦','自分より年下の男のきょうだい','弟は年下の男のきょうだいです。'],
    [5,'いもうと','👧','自分より年下の女のきょうだい','妹は年下の女のきょうだいです。'],
    [5,'ながぐつ','🥾','雨の日や水たまりで使う丈の長い靴','長靴は雨の日などに使います。'],
    [5,'くつした','🧦','靴の中に履く布のもの','靴下は足を覆う衣類です。'],
    [5,'えんそく','🎒','学校などでみんなと出かける行事','遠足は校外などへ出かける行事です。'],
    [6,'しんごうき','🚦','道路で赤・青・黄の色を示す機械','信号機は交通の安全を助けます。'],
    [6,'きゅうきゅうしゃ','🚑','病人やけが人を運ぶ緊急車両','救急車は緊急時の搬送に使われます。'],
    [6,'しょくどう','🍽️','料理を食べられる場所','食堂は食事ができる場所です。'],
    [6,'ゆうびんきょく','🏣','手紙を出したり切手を買ったりする場所','郵便局は郵便などを扱う施設です。'],
    [6,'どうぶつえん','🦒','いろいろな動物を見られる施設','動物園では多くの動物を観察できます。'],
    [6,'うんどうかい','🏃','学校などで走ったり競技をしたりする行事','運動会ではさまざまな競技をします。'],
    [6,'けいたいでんわ','📱','持ち歩ける電話','携帯電話は外出先でも連絡に使えます。'],
    [6,'みずたまり','💦','雨のあと地面に水がたまった場所','水たまりは地面に水がたまった状態です。'],
    [6,'てんきよほう','🌦️','明日などの天気を知らせる情報','天気予報は天候を予測した情報です。'],
    [6,'おべんとう','🍱','箱に詰めて持ち歩く食事','お弁当は持ち運べる食事です。'],
    [7,'しんかんせん','🚄','速く走る日本の鉄道','新幹線は都市間を速く移動できます。'],
    [7,'じどうはんばいき','🥤','お金を入れて飲み物などを買う機械','自動販売機は商品を自動で販売します。'],
    [7,'こうつうあんぜん','🚸','道路や乗り物で事故を防ぐための心がけ','交通安全は事故を防ぐ取り組みです。'],
    [7,'しょうがっこう','🏫','子どもが学ぶ学校の一つ','小学校では基礎的な学習をします。'],
    [7,'としょしつ','📖','学校などにある本を読む部屋','図書室では本を読めます。'],
    [7,'うちゅうせん','🚀','宇宙へ行くための乗り物','宇宙船は宇宙で使う乗り物です。'],
    [7,'さんかくけい','🔺','辺が三つある図形','三角形には三つの辺があります。'],
    [7,'けいさつかん','👮','町の安全を守る仕事をする人','警察官は事件や交通安全などに対応します。'],
    [7,'りょうりにん','👩‍🍳','料理を作ることを仕事にする人','料理人は食事を作る仕事です。'],
    [7,'あまのがわ','🌌','夜空に帯のように見えるたくさんの星','天の川は銀河の星々が集まって見えるものです。'],
    [8,'じゅんびうんどう','🤸','運動の前に体をほぐすこと','準備運動は体を動かす前に行います。'],
    [8,'きょうりょく','🤝','ほかの人と力を合わせること','協力は互いに力を合わせることです。'],
    [8,'かんしゃじょう','💌','ありがとうの気持ちを伝える文書','感謝状は感謝を表す文書です。'],
    [8,'ひなんけいろ','🚪','災害のとき安全な場所へ移動する道順','避難経路は安全な場所へ行く道筋です。'],
    [8,'かいものぶくろ','🛍️','買った品物を入れる袋','買い物袋には購入した商品を入れます。'],
    [8,'こうさてん','🚦','道路どうしが交わる場所','交差点では複数の道が交わります。'],
    [8,'とどうふけん','🗾','日本の各地域の行政上の区分の呼び名','都道府県は日本の地域区分です。'],
    [8,'ちずきごう','🗺️','地図で施設などを示す小さな印','地図記号は地図上の場所を表します。'],
    [8,'こうれいしゃ','👴','年齢が高い人を表す言葉','高齢者は年齢が高い人を指します。'],
    [8,'けんこうかんり','🩺','体調や生活習慣に気を配ること','健康管理は日々の体調に気を配ることです。'],
    [9,'きんきゅうれんらく','☎️','急ぎの用件を相手に知らせること','緊急連絡は急いで情報を伝えることです。'],
    [9,'てんきよほうし','☀️','気象の予報を伝える専門職の人','天気予報士は天気を伝える仕事に関わります。'],
    [9,'じこしょうかい','🙋','初めて会う人に自分のことを伝えること','自己紹介は名前などを伝えることです。'],
    [9,'しんこきゅう','🌬️','大きく息を吸ってゆっくり吐くこと','深呼吸は大きくゆっくり呼吸することです。'],
    [9,'ゆうせんせき','💺','必要な人が優先して座れる席','優先席は配慮が必要な人のための席です。'],
    [9,'しょうがいぶつ','🚧','進むときに邪魔になる物','障害物は移動などの妨げになる物です。'],
    [9,'せいかつしゅうかん','📆','毎日の暮らしで続けている行動','生活習慣は日々繰り返す行動です。'],
    [9,'あんぜんかくにん','✅','危険がないか調べること','安全確認は危険がないか確かめることです。'],
    [9,'こうつうきかん','🚌','人を運ぶバス・電車などの総称','交通機関には電車やバスなどがあります。'],
    [9,'しぜんかんさつ','🔎','植物や虫など自然の様子をよく見ること','自然観察は自然の様子を調べることです。'],
    [10,'さいがいようひん','🎒','災害に備えて用意する道具など','災害用品は非常時に役立つものです。'],
    [10,'しょくひんえいせい','🧼','食べ物を安全に扱うための衛生管理','食品衛生は食べ物の安全を守ることです。'],
    [10,'しょうひきげん','📅','安全に食べられる期限を示す表示','消費期限は安全に食べられる期限の目安です。'],
    [10,'いっしょうけんめい','💪','力を尽くして取り組むこと','一生懸命は全力で取り組む様子です。'],
    [10,'しょうじょうほうこく','📝','体調の変化や症状を伝えること','症状報告は体の様子を人に知らせることです。'],
    [10,'くすりのせつめい','💊','薬の飲み方や注意点などの案内','薬の説明は使い方や注意点を確認するものです。'],
    [10,'かんじょうひょうげん','💬','うれしい・悲しいなどの気持ちを伝えること','感情表現は気持ちを言葉や動作で伝えることです。'],
    [10,'かんきょうほぜん','🌱','自然や暮らしの環境を守ること','環境保全は環境を大切に守る取り組みです。'],
    [10,'じかんかんり','⏰','予定を考えて時間を使うこと','時間管理は予定を考えて行動することです。'],
    [10,'せいかつりずむ','🌅','起きる・食べる・寝るなどの生活の周期','生活リズムは毎日の生活の時間的な流れです。']
  ];
  const bridge = window.KotobaCatPuzzleIntegration;
  const state = {
    mode:'ready',level:1,count:5,size:5,questions:[],index:0,correct:0,
    attempts:0,hints:0,board:[],path:[],solutionPath:[],hintCell:null,
    answers:[],startedAt:null,timer:null,previous:'playing',dragging:false,
    points:0,combo:0,bestCombo:0
  };
  let cat3d=null,audioCtx=null;
  // Android最新版と同じ既存音源。PC版でも共通の効果音音量を適用する。
  const puzzleCueFiles={correct:'sounds/quiz-correct-3.mp3',wrong:'sounds/quiz-wrong-1.mp3'};
  const puzzleCuePlayers=Object.create(null);
  function playPuzzleCue(kind){
    const src=puzzleCueFiles[kind];
    if(!src)return;
    try{
      const prefs=JSON.parse(localStorage.getItem('kotobaquest_audio_v86')||'{}');
      if(prefs.seOn===false)return;
      const volume=window.KotobaAudio?.seLevel?.()??Math.max(0,Math.min(1,
        Number(localStorage.getItem('kotobaquest_volume_v3')||60)/100*
        Number(prefs.se==null?100:prefs.se)/100));
      if(volume<=0)return;
      if(!window.Audio){beep(kind==='wrong'?300:750);return;}
      const player=puzzleCuePlayers[kind]||(puzzleCuePlayers[kind]=new window.Audio(src));
      player.volume=Math.max(0,Math.min(1,volume*.48));player.currentTime=0;
      const pending=player.play();if(pending?.catch)pending.catch(()=>beep(kind==='wrong'?300:750));
    }catch(_){beep(kind==='wrong'?300:750)}
  }
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const shuffle=items=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const letters=q=>Array.from(q[1]);
  const boardSize=level=>level<=3?5:6;
  function chooseQuestions(level,count){
    let pool=WORDS.filter(w=>w[0]>=Math.max(1,level-2)&&w[0]<=level);
    if(pool.length<count)pool=WORDS.filter(w=>w[0]<=level);
    return shuffle(pool).slice(0,count);
  }
  function updateLevelOptions(){
    const progress=bridge?bridge.getProgress():{selected:1,unlocked:1};
    const unlocked=clamp(Number(progress.unlocked)||1,1,10);
    const selected=clamp(Number(progress.selected)||1,1,unlocked);
    $('levelSelect').replaceChildren();
    for(let level=1;level<=unlocked;level++){
      const option=document.createElement('option');
      option.value=String(level);
      option.textContent='Lv.'+level+(level<=3?' やさしい':level<=6?' ふつう':level<=8?' 発展':' チャレンジ');
      $('levelSelect').appendChild(option);
    }
    $('levelSelect').value=String(selected);
  }
  function writeMessage(message,tone){
    $('message').textContent=message;
    $('message').className=tone||'';
  }
  function catSay(message){$('catBubble').textContent=message;}
  function beep(freq=540,duration=.12){
    const kind=freq<400?'cardMismatch':freq>=780?'cardCombo':'cardMatch';
    if(window.KotobaSharedSFX){window.KotobaSharedSFX.play(freq<400?'wrong':freq>=780?'finish':'correct');return;}
    if(window.KotobaSoundDesign?.play(kind))return;
    const volume=window.KotobaAudio?.seLevel?.()??1;
    if(volume<=0)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      audioCtx.resume().catch(()=>{});
      const oscillator=audioCtx.createOscillator(),gain=audioCtx.createGain();
      oscillator.type='sine';oscillator.frequency.value=freq;
      gain.gain.setValueAtTime(.035*volume,audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);
      oscillator.connect(gain);gain.connect(audioCtx.destination);
      oscillator.start();oscillator.stop(audioCtx.currentTime+duration);
    }catch(_){}
  }
  function speak(){
    const q=state.questions[state.index];
    if(!q||state.mode!=='playing')return;
    const message=q[3]+'。'+letters(q).length+'文字の言葉を、縦か横でつなげてください。';
    try{if(window.AndroidSpeech?.speak){window.AndroidSpeech.speak(message);return;}}catch(_){}
    try{
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
        const utterance=new SpeechSynthesisUtterance(message);
        utterance.lang='ja-JP';utterance.rate=.88;
        if(window.KotobaSharedSFX){utterance.volume=window.KotobaSharedSFX.voiceLevel();if(utterance.volume<=0)return;}
        window.speechSynthesis.speak(utterance);
      }
    }catch(_){}
  }
  function neighbors(cell,size){
    const row=Math.floor(cell/size),column=cell%size,result=[];
    if(row>0)result.push(cell-size);
    if(row<size-1)result.push(cell+size);
    if(column>0)result.push(cell-1);
    if(column<size-1)result.push(cell+1);
    return result;
  }
  function adjacent(a,b,size){
    return Math.abs(Math.floor(a/size)-Math.floor(b/size))+
      Math.abs(a%size-b%size)===1;
  }
  function createWordPath(length,size){
    for(let attempt=0;attempt<70;attempt++){
      const current=[Math.floor(Math.random()*size*size)],seen=new Set(current);
      function seek(){
        if(current.length===length)return true;
        const next=shuffle(neighbors(current[current.length-1],size));
        for(const cell of next){
          if(seen.has(cell))continue;
          seen.add(cell);current.push(cell);
          if(seek())return true;
          current.pop();seen.delete(cell);
        }
        return false;
      }
      if(seek())return current.slice();
    }
    // 最終手段として、必ず隣のマスへ進める蛇行経路を使います。
    const path=[];
    for(let row=0;row<size;row++){
      const cols=Array.from({length:size},(_,i)=>row%2===0?i:size-i-1);
      for(const col of cols)path.push(row*size+col);
    }
    return path.slice(0,length);
  }
  function randomLetter(){
    const alphabet='あいうえおかきくけこがぎぐげごさしすせそざじずぜぞたちつてとだぢづでどなにぬねのはひふへほばびぶべぼまみむめもやゆよらりるれろわをん';
    return alphabet[Math.floor(Math.random()*alphabet.length)];
  }
  function seedBoard(question,reuse){
    const size=boardSize(state.level),total=size*size;
    state.size=size;
    const base=reuse&&state.board.length===total?state.board.slice():
      Array.from({length:total},()=>randomLetter());
    const path=createWordPath(letters(question).length,size);
    letters(question).forEach((char,index)=>{base[path[index]]=char;});
    state.board=base;
    state.solutionPath=path;
    state.path=[];state.hintCell=null;
    renderBoard();
  }
  function paintConnections(){
    const overlay=$('connections'),grid=$('letterGrid');
    overlay.replaceChildren();
    if(state.path.length<2)return;
    const area=overlay.getBoundingClientRect();
    const points=state.path.map(index=>{
      const cell=grid.querySelector('[data-cell="'+index+'"]');
      if(!cell)return null;
      const rect=cell.getBoundingClientRect();
      return [rect.left+rect.width/2-area.left,rect.top+rect.height/2-area.top];
    }).filter(Boolean);
    if(points.length<2)return;
    const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    line.setAttribute('points',points.map(p=>p.join(',')).join(' '));
    line.setAttribute('fill','none');
    line.setAttribute('stroke','#ef9e2d');
    line.setAttribute('stroke-width','10');
    line.setAttribute('stroke-linecap','round');
    line.setAttribute('stroke-linejoin','round');
    line.setAttribute('opacity','.85');
    overlay.appendChild(line);
    points.forEach(([x,y])=>{
      const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('cx',String(x));circle.setAttribute('cy',String(y));
      circle.setAttribute('r','4');circle.setAttribute('fill','#fff4d1');
      overlay.appendChild(circle);
    });
  }
  function updatePreview(){
    const q=state.questions[state.index];
    if(!q)return;
    const typed=state.path.map(i=>state.board[i]).join(' ');
    const blanks=Array.from({length:Math.max(0,letters(q).length-state.path.length)},()=> '□').join(' ');
    $('currentWord').textContent=(typed?typed+' ':'')+blanks;
    $('comboBadge').textContent='🔥 コンボ '+state.combo;
    $('comboBadge').classList.toggle('hot',state.combo>=2);
    $('pointsBadge').textContent='🏆 '+state.points+' pt';
    $('mistakeBadge').textContent='まちがい '+state.attempts+'/3';
    $('undoBtn').disabled=state.mode!=='playing'||state.path.length===0;
    $('clearBtn').disabled=state.mode!=='playing'||state.path.length===0;
    $('hintBtn').disabled=state.mode!=='playing';
    $('shuffleBtn').disabled=state.mode!=='playing';
  }
  // 【renderBoard】文字盤を表示します。タッチ・マウスの両方で位置が一致するようにします。
  function renderBoard(fallOffsets){
    const grid=$('letterGrid'),fragment=document.createDocumentFragment();
    grid.style.setProperty('--columns',String(state.size));
    state.board.forEach((char,index)=>{
      const button=document.createElement('button');
      button.type='button';button.className='grid-tile';
      button.dataset.cell=String(index);
      button.textContent=char;button.setAttribute('aria-label','文字 '+char);
      const isSelected=state.path.includes(index);
      if(isSelected)button.classList.add('selected');
      if(state.hintCell===index||
         (state.mode==='incorrect'&&state.attempts>=3&&state.solutionPath.includes(index)))
        button.classList.add('hint');
      if(state.mode==='incorrect'&&isSelected)button.classList.add('wrong');
      if(state.mode==='correct'&&isSelected)button.classList.add('clearing');
      if(fallOffsets){
        button.classList.add('falling');
        button.style.setProperty('--fall',String(fallOffsets[index]||2));
        button.style.setProperty('--fall-delay',String((index%state.size)*45)+'ms');
      }
      button.disabled=state.mode!=='playing';
      fragment.appendChild(button);
    });
    grid.replaceChildren(fragment);
    updatePreview();
    window.requestAnimationFrame(paintConnections);
  }
  function addCell(index){
    if(state.mode!=='playing'||!Number.isInteger(index)||index<0||index>=state.board.length)return;
    const path=state.path,last=path[path.length-1];
    if(last===index)return;
    if(path.length&&path.length>=2&&path[path.length-2]===index){
      path.pop();renderBoard();return;
    }
    if(path.includes(index)||path.length&&!adjacent(last,index,state.size))return;
    path.push(index);
    beep(395+path.length*43,.055);
    renderBoard();
    if(path.length>=letters(state.questions[state.index]).length)checkWord();
  }
  // 【checkWord】選んだ文字が正解語か判定します。
  function checkWord(){
    if(state.mode!=='playing')return;
    const q=state.questions[state.index];
    const typed=state.path.map(i=>state.board[i]).join('');
    const correct=typed===q[1];
    showFeedback(correct,typed);
  }
  function recordAnswer(correct,typed){
    const q=state.questions[state.index];
    const info={prompt:q[3],selected:typed,right:q[1],success:correct,
      explain:q[4],wrongAttempts:state.attempts,hints:state.hints};
    state.answers.push(info);
    bridge?.answer(q,correct,typed,state.attempts);
  }
  function clearPath(){
    if(state.mode!=='playing')return;
    state.path=[];renderBoard();
  }
  function burst(message){
    const el=$('burst');
    el.textContent=message;
    el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  }
  function gravityDrop(){
    const size=state.size,removed=new Set(state.path),next=new Array(size*size),offsets=new Array(size*size);
    for(let col=0;col<size;col++){
      const remaining=[];
      for(let row=size-1;row>=0;row--){
        const index=row*size+col;
        if(!removed.has(index))remaining.push({char:state.board[index],from:row});
      }
      for(let row=size-1;row>=0;row--){
        const index=row*size+col,item=remaining.shift();
        next[index]=item?item.char:randomLetter();
        offsets[index]=item?Math.max(1,row-item.from):row+2;
      }
    }
    state.board=next;state.path=[];state.hintCell=null;
    renderBoard(offsets);
    state.timer=setTimeout(()=>nextQuestion(true),950);
  }
  function showFeedback(correct,typed){
    const q=state.questions[state.index];
    if(correct){
      state.correct++;
      state.combo++;
      state.bestCombo=Math.max(state.combo,state.bestCombo);
      const bonus=Math.max(0,100+(state.combo-1)*35-state.hints*15);
      state.points+=bonus;
      state.mode='correct';recordAnswer(true,typed);
      cat3d?.celebrate?.();playPuzzleCue('correct');
      catSay(state.combo>=2?'すごい！ '+state.combo+'コンボ！':'正解！ 文字が落ちてくるよ！');
      burst((state.combo>=2?state.combo+' COMBO! ':'')+'+'+bonus+' pt');
      writeMessage('✨ 正解！ '+q[4]+'　+'+bonus+'pt','correct');
      renderBoard();
      state.timer=setTimeout(gravityDrop,720);
      return;
    }
    state.attempts++;
    state.combo=0;
    state.mode='incorrect';playPuzzleCue('wrong');
    if(state.attempts>=3){
      recordAnswer(false,typed);
      catSay('正解は「'+q[1]+'」。次も挑戦しよう。');
      writeMessage('正解は「'+q[1]+'」です。'+q[4],'incorrect');
      renderBoard();
      state.timer=setTimeout(()=>nextQuestion(false),2400);
      return;
    }
    catSay('おしい！ あと'+(3-state.attempts)+'回チャレンジできるよ。');
    writeMessage('「'+typed+'」ではありません。別の文字をなぞってみよう。','incorrect');
    renderBoard();
    state.timer=setTimeout(()=>{
      state.mode='playing';state.path=[];
      writeMessage('気になる文字から、たて・よこにつないでみよう。');
      renderBoard();
    },850);
  }
  function updateQuestion(reuse){
    const q=state.questions[state.index];
    state.mode='playing';state.attempts=0;state.hints=0;
    $('levelBadge').textContent='Lv.'+state.level;
    $('questionCounter').textContent=(state.index+1)+' / '+state.questions.length+' 問';
    $('scoreBadge').textContent='⭐ '+state.correct+' 正解';
    $('progressFill').style.width=Math.round(state.index/state.questions.length*100)+'%';
    $('clueEmoji').textContent=q[2];
    $('clueText').textContent=q[3];
    $('clueCount').textContent='答えは '+letters(q).length+'文字。たて・よこに文字をつなごう';
    catSay('答えの文字が、盤面のどこかにつながっているよ！');
    writeMessage('👆 文字を指でなぞるか、隣の文字をタップしてください。');
    seedBoard(q,reuse);
  }
  function nextQuestion(reuse){
    state.timer=null;state.index++;
    if(state.index>=state.questions.length){finish();return;}
    updateQuestion(reuse);
  }
  // 【begin】文字盤の作成とゲーム開始を行います。3Dの起動失敗時にも文字パズルを継続します。
  function begin(level,count){
    window.KotobaSoundPack?.play('tap');
    if(state.timer){clearTimeout(state.timer);state.timer=null;}
    state.level=clamp(level||1,1,10);state.count=clamp(count||5,5,20);
    state.questions=chooseQuestions(state.level,state.count);
    state.index=0;state.correct=0;state.points=0;state.combo=0;state.bestCombo=0;
    state.answers=[];state.startedAt=new Date().toISOString();state.board=[];
    state.dragging=false;
    bridge?.begin(state.level);cat3d?.start?.();
    $('startOverlay').hidden=true;$('settingsOverlay').hidden=true;$('resultOverlay').hidden=true;
    updateQuestion(false);
  }
  // 【finish】結果画面と記録連携を確定します。
  function finish(){
    state.mode='results';
    window.KotobaSoundPack?.play(state.correct===state.questions.length?'clear':'record');
    const total=state.questions.length;
    const details=bridge?.finish({startedAt:state.startedAt,answers:state.answers,
      score:state.correct,total,puzzlePoints:state.points,bestCombo:state.bestCombo});
    $('progressFill').style.width='100%';
    $('scoreBadge').textContent='⭐ '+state.correct+' 正解';
    $('resultScore').textContent=state.correct+' / '+total+' 正解 ・ '+state.points+'pt';
    $('resultReward').textContent='🏅 メダル +'+(details?.medals??0)+'　🔥 最大 '+state.bestCombo+'コンボ'+
      (details&&!details.medalSaved?'（メダルを保存できませんでした）':'');
    const mastery=details?.mastery;
    $('masteryResult').textContent=mastery?
      'Lv.'+mastery.level+' 熟練度 '+mastery.before+' → '+mastery.points+'/100'+
      (mastery.raised?' 🎉 次のレベル解放！':''):
      '難易度・熟練度は記録されませんでした。';
    if(details&&!details.recordSaved)$('masteryResult').textContent+=' ※学習記録を保存できませんでした。';
    $('review').replaceChildren();
    state.answers.forEach((answer,i)=>{
      const row=document.createElement('div');row.className='review-item';
      const heading=document.createElement('strong');
      heading.textContent=(answer.success?'✅':'❌')+' '+(i+1)+'. '+answer.prompt;
      const chosen=document.createElement('span');
      chosen.textContent='回答：'+answer.selected+'　正解：'+answer.right+
        '　誤答：'+answer.wrongAttempts+'回';
      const explain=document.createElement('span');
      explain.textContent='復習ポイント：'+answer.explain;
      row.append(heading,chosen,explain);$('review').appendChild(row);
    });
    catSay('おつかれさま！ コンボにまた挑戦してね！');
    updateLevelOptions();$('resultOverlay').hidden=false;
  }
  function openSettings(){
    if(state.mode==='correct'||state.mode==='incorrect')return;
    state.previous=state.mode;state.mode='paused';
    updateLevelOptions();$('countSelect').value=String(state.count);
    $('resultOverlay').hidden=true;$('settingsOverlay').hidden=false;
  }
  function closeSettings(){
    $('settingsOverlay').hidden=true;state.mode=state.previous;
    if(state.mode==='results')$('resultOverlay').hidden=false;
    renderBoard();
  }
  const grid=$('letterGrid');
  grid.addEventListener('pointerdown',event=>{
    const cell=event.target.closest?.('.grid-tile');
    if(!cell||state.mode!=='playing')return;
    event.preventDefault();
    state.dragging=true;
    try{grid.setPointerCapture(event.pointerId);}catch(_){}
    addCell(Number(cell.dataset.cell));
  });
  grid.addEventListener('pointermove',event=>{
    if(!state.dragging||state.mode!=='playing')return;
    const element=document.elementFromPoint(event.clientX,event.clientY);
    const cell=element?.closest?.('.grid-tile');
    if(cell&&grid.contains(cell))addCell(Number(cell.dataset.cell));
  });
  const endGesture=()=>{state.dragging=false;};
  grid.addEventListener('pointerup',endGesture);
  grid.addEventListener('pointercancel',endGesture);
  grid.addEventListener('lostpointercapture',endGesture);
  // キーボード、スイッチ入力、スクリーンリーダーの決定操作にも対応。
  grid.addEventListener('click',event=>{
    if(event.detail!==0)return;
    const cell=event.target.closest?.('.grid-tile');
    if(cell)addCell(Number(cell.dataset.cell));
  });
  $('startBtn').addEventListener('click',()=>begin(
    Number($('levelSelect').value)||1,Number($('countSelect').value)||5));
  $('speakBtn').addEventListener('click',speak);
  $('undoBtn').addEventListener('click',()=>{
    if(state.mode==='playing'&&state.path.length){state.path.pop();renderBoard();}
  });
  $('clearBtn').addEventListener('click',clearPath);
  $('shuffleBtn').addEventListener('click',()=>{
    if(state.mode!=='playing')return;
    seedBoard(state.questions[state.index],false);
    writeMessage('🔀 新しい盤面に変えたよ。ゆっくり探してみよう。');
    catSay('どこに言葉があるか探してね！');
  });
  $('hintBtn').addEventListener('click',()=>{
    if(state.mode!=='playing')return;
    window.KotobaSoundPack?.play('tap');
    state.hints++;state.hintCell=state.solutionPath[0];
    writeMessage('💡 最初の文字は「'+letters(state.questions[state.index])[0]+
      '」。光るマスからつなげてみよう。');
    catSay('キラキラ光るマスがヒントだよ！');
    renderBoard();
  });
  $('settingsBtn').addEventListener('click',openSettings);
  $('applySettings').addEventListener('click',()=>{
    const level=Number($('levelSelect').value)||1,count=Number($('countSelect').value)||5;
    bridge?.setLevel(level);begin(level,count);
  });
  $('cancelSettings').addEventListener('click',closeSettings);
  $('retryBtn').addEventListener('click',()=>begin(state.level,state.count));
  const goBack=()=>{window.location.href='index.html?v=veta29#3d-games';};
  $('returnBtn').addEventListener('click',goBack);
  $('resultBackBtn').addEventListener('click',goBack);
  window.addEventListener('resize',()=>window.requestAnimationFrame(paintConnections));
  updateLevelOptions();
  for(const id of ['undoBtn','clearBtn','hintBtn','shuffleBtn'])$(id).disabled=true;
  // 3D未対応でも言葉パズルの進行と学習記録を優先します。
  Promise.resolve({mount3DCat:window.KQMount3DCat}).then(module=>
    {if(typeof module.mount3DCat!=='function')throw Error('PC用3D猫エンジンが読み込めません');return module.mount3DCat($('catStage'));}).then(controller=>{
      cat3d=controller;
      if(state.mode==='playing'||state.mode==='correct'||state.mode==='incorrect')
        cat3d?.start?.();
      $('gameError').textContent='';
      if(state.mode==='ready')catSay('猫の準備ができたよ！ タップして始めよう。');
    }).catch(error=>{
      $('gameError').textContent='3D猫が表示できない環境でも、ことばパズルは遊べます。';
      console.warn('Cat word trace 3D unavailable',error);
    });
})();
