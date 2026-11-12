/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/questions/question-bank-veta11.js
 * 役割：各ジャンルの追加問題データ、別表記と個別ヒント
 * 利用画面：index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA11 / browser: original banks stay intact; 100 additional variations per
 * compatible training activity.  Vocabulary is arranged from familiar words
 * to longer social/medical/administrative language.  All answers are local.
 * Visual activities reuse the existing verified photographs; they do NOT
 * claim to introduce 100 different photographic subjects. */
(function (root) {
  'use strict';
  if (!root.QUESTIONS || root.__kotobaExpandedV11) return;
  root.__kotobaExpandedV11 = true;

  // word | explanatory clue | natural spoken example. Ten rows per level.
  var TIER_DATA = [
    `いえ|人が暮らす建物|家に帰ります。
はな|植物に咲く色鮮やかな部分|庭に花が咲きました。
みず|のどが渇いたときに飲むもの|水をゆっくり飲みます。
やま|高く盛り上がった土地|遠くに山が見えます。
かわ|水が流れている場所|川のそばを歩きました。
そら|頭の上に広がる空間|青い空を見上げます。
あめ|空から降る水の粒|雨が降ってきました。
ねこ|ニャーと鳴く動物|猫が静かに眠っています。
いぬ|ワンと鳴く動物|犬と散歩に出かけます。
かさ|雨にぬれないために使う道具|傘を持って出かけます。`,
    `りんご|赤や緑の丸い果物|りんごを一つ食べます。
みかん|皮をむいて食べる柑橘類|みかんの皮をむきます。
バナナ|黄色い皮のある細長い果物|バナナを朝ごはんに食べます。
とけい|時刻を知るための道具|時計で時間を確かめます。
くつ|外を歩くとき足にはくもの|靴をそろえて置きます。
ほん|文字や絵が載っている冊子|本を一冊読みます。
パン|小麦粉などから作る食べ物|パンを温めて食べます。
バス|道路を走る大型の乗り物|バスで駅まで行きます。
つくえ|物を置いて作業する家具|机の上を片づけます。
いす|腰をかけて座る家具|椅子にゆっくり座ります。`,
    `おちゃ|茶葉などから作る飲み物|温かいお茶を入れます。
たまご|殻に包まれた料理の材料|卵をフライパンで焼きます。
さかな|水の中を泳ぐ動物|魚を焼いて食べます。
やさい|畑などで育てる食材|野菜をきれいに洗います。
まくら|眠るとき頭の下に置くもの|枕の位置を直します。
てがみ|文章を書いて相手に送るもの|手紙をポストに入れます。
くるま|道路を走る四輪の乗り物|車で買い物に出かけます。
でんわ|離れた相手と話す道具|家族に電話をかけます。
でんしゃ|線路の上を走る乗り物|電車がホームに到着します。
かばん|持ち物を入れて運ぶもの|かばんに財布を入れます。`,
    `はさみ|紙などを切る道具|はさみで紙を切ります。
えんぴつ|文字を書くための文房具|鉛筆で名前を書きます。
コップ|飲み物を入れる容器|コップに水を注ぎます。
タオル|手や顔を拭く布|タオルで手を拭きます。
てぶくろ|寒さから手を守るもの|手袋を両手にはめます。
くつした|足にはく布製の衣類|靴下を左右そろえます。
おさら|料理を盛りつける器|お皿を食卓に並べます。
せっけん|汚れを落とすために使うもの|石けんで手を洗います。
かがみ|自分の姿を映すもの|鏡を見て髪を整えます。
しんぶん|出来事や情報を伝える印刷物|新聞の見出しを読みます。`,
    `おにぎり|ごはんを手でまとめた食べ物|おにぎりをお昼に食べます。
さくらんぼ|小さくて赤い果物|さくらんぼを二つ並べます。
ひこうき|空を飛んで人や物を運ぶ乗り物|飛行機が空を飛んでいます。
じてんしゃ|ペダルをこいで進む乗り物|自転車で公園に行きます。
おふろ|体を温めたり洗ったりする場所|お風呂のお湯を確かめます。
おかいもの|店で商品を選んで買うこと|午後に買い物へ出かけます。
おはよう|朝に交わすあいさつ|朝になったらおはようと言います。
ありがとう|感謝を伝える言葉|助けてもらったらありがとうと伝えます。
こんにちは|昼間に会ったときのあいさつ|友だちにこんにちはと声をかけます。
さようなら|別れるときに使うあいさつ|帰る前にさようならと言います。`,
    `ゆうびんきょく|手紙や荷物を出す場所|郵便局で切手を買います。
としょかん|本を読んだり借りたりする施設|図書館で本を借ります。
れいぞうこ|食材を冷やして保存する家電|冷蔵庫に牛乳をしまいます。
たいおんけい|体の温度を調べる道具|体温計で熱を測ります。
ふらいぱん|材料を焼いたり炒めたりする鍋|フライパンで野菜を炒めます。
こうさてん|道路が交わる場所|交差点で信号を確かめます。
しんごうき|道路で進むか止まるかを示す装置|信号機が青になりました。
かいさつぐち|駅で切符などを確認する場所|改札口で交通系カードを使います。
ほうき|床のごみを集める掃除道具|ほうきで床を掃きます。
そうじき|床のごみを吸い取る家電|掃除機を使って部屋を掃除します。`,
    `しょくじ|食べ物をとること|食事の前に手を洗います。
よやく|予定する時間や場所を先に押さえること|電話で予約を入れます。
おつり|支払った金額から戻るお金|買い物のおつりを受け取ります。
おかいけい|買った品物などの代金を払うこと|食事が終わったのでお会計をします。
てつだい|相手の作業を助けること|重い荷物を運ぶ手伝いをします。
おねがい|相手に希望を伝えて頼むこと|店員さんにお願いを伝えます。
やすみじかん|作業の合間に休憩する時間|休み時間に水を飲みます。
でんきゅう|電気で光る照明の部品|切れた電球を交換します。
かんごし|医療現場で患者を支える専門職|看護師さんに体調を伝えます。
うんてんしゅ|車やバスなどを運転する人|運転手さんに行き先を確認します。`,
    `けんこうしんだん|体の状態を定期的に調べること|健康診断の日程を確認します。
しんさつけん|医療機関の受付で提示するカード|受付で診察券を出します。
かんじゃさん|医療機関で診察や治療を受ける人|患者さんが順番を待っています。
しょほうせん|医師が薬の内容を指示する書類|処方箋を薬局に持っていきます。
あんないひょうじ|場所や進み方を知らせる掲示|駅の案内表示をよく見ます。
えきいんさん|駅で案内や安全確認を行う人|駅員さんに乗り場を尋ねます。
しょくざい|料理の材料になる食べ物|必要な食材を確認します。
りょうしゅうしょ|代金を受け取った証明の書類|領収書を大切に保管します。
うけつけ|来訪者の用件を最初に確認する場所|受付で名前を伝えます。
れんらくさき|相手と連絡するための番号や住所|緊急時の連絡先を確認します。`,
    `こうきょうこうつう|電車やバスなど皆が利用する交通手段|公共交通を利用して病院へ行きます。
りようあんない|施設の使い方を知らせる説明|利用案内を読んで手順を確かめます。
きんきゅうれんらく|急いで必要な情報を伝えること|緊急連絡の方法を確認します。
あんぜんかくにん|危険がないか確かめること|作業を始める前に安全確認をします。
じゅんびたいそう|運動前に体をゆっくり動かすこと|準備体操で肩を軽く動かします。
せいかつしゅうかん|毎日の暮らしの中で続けている行動|生活習慣を見直してみます。
ひなんけいろ|危険から離れるために通る道|避難経路をあらかじめ確かめます。
こうつうきそく|道路を安全に利用するための決まり|交通規則を守って横断します。
かいものりすと|買う物を忘れないための一覧|買い物リストを持って店に行きます。
てんきよほう|これからの天気を知らせる情報|天気予報を見て傘を準備します。`,
    `たいちょうかんり|自分の体の変化を把握すること|体調管理のために睡眠を記録します。
じかんかんり|予定に合わせて時間を使うこと|時間管理を意識して出発します。
ことばのれんしゅう|言葉を思い出したり話したりする練習|言葉の練習を毎日少しずつ行います。
きんきゅうじたい|すぐに対応が必要な深刻な状況|緊急事態では周囲に助けを求めます。
いりょうきかん|診察や治療を行う施設の総称|医療機関の受付時間を調べます。
びょういんよやく|病院で診てもらう日時を決めること|病院予約の日時をメモします。
しゅうだんかつどう|複数の人が協力して行う活動|集団活動では順番を守って話します。
ちいきこうりゅう|地域の人同士が関わること|地域交流の行事に参加しました。
たいおうほうほう|状況に応じてどう行動するかの手順|対応方法を確認して落ち着いて行動します。
りょうかいしました|相手の説明を理解したと伝える言葉|説明を聞いたあと了解しましたと伝えます。`
  ];
  var items = [];
  TIER_DATA.forEach(function (block, index) {
    block.split('\n').forEach(function (line) {
      var p = line.split('|'); if (p.length !== 3) throw new Error('不正なVETA11語彙行');
      items.push({word:p[0], clue:p[1], sentence:p[2], level:index + 1});
    });
  });
  if (items.length !== 100) throw new Error('VETA11語彙は100件必要です: ' + items.length);
  // AI会話は読みだけでなく、各問題の一般的な漢字表記も正解とする。
  // 漢字の機械的な読み替えは同音異義語の誤判定が起きるため、問題ごとの対応表に限定する。
  var KANJI_ALIASES = {
    いえ:['家'],はな:['花'],みず:['水'],やま:['山'],かわ:['川'],そら:['空'],
    あめ:['雨'],ねこ:['猫'],いぬ:['犬'],かさ:['傘'],りんご:['林檎'],みかん:['蜜柑'],
    とけい:['時計'],くつ:['靴'],ほん:['本'],つくえ:['机'],いす:['椅子'],
    おちゃ:['お茶','茶'],たまご:['卵'],さかな:['魚'],やさい:['野菜'],
    まくら:['枕'],てがみ:['手紙'],くるま:['車'],でんわ:['電話'],でんしゃ:['電車'],かばん:['鞄'],
    はさみ:['鋏'],えんぴつ:['鉛筆'],てぶくろ:['手袋'],くつした:['靴下'],
    おさら:['お皿','皿'],せっけん:['石鹸'],かがみ:['鏡'],しんぶん:['新聞'],
    おにぎり:['お握り'],さくらんぼ:['桜桃'],ひこうき:['飛行機'],
    じてんしゃ:['自転車'],おふろ:['お風呂','風呂'],おかいもの:['お買い物','買い物'],
    ゆうびんきょく:['郵便局'],としょかん:['図書館'],れいぞうこ:['冷蔵庫'],
    たいおんけい:['体温計'],こうさてん:['交差点'],しんごうき:['信号機'],
    かいさつぐち:['改札口'],ほうき:['箒'],そうじき:['掃除機'],
    しょくじ:['食事'],よやく:['予約'],おつり:['お釣り','釣り'],
    おかいけい:['お会計','会計'],てつだい:['手伝い'],おねがい:['お願い'],
    やすみじかん:['休み時間'],でんきゅう:['電球'],かんごし:['看護師'],
    うんてんしゅ:['運転手'],けんこうしんだん:['健康診断'],しんさつけん:['診察券'],
    かんじゃさん:['患者さん'],しょほうせん:['処方箋'],あんないひょうじ:['案内表示'],
    えきいんさん:['駅員さん'],しょくざい:['食材'],りょうしゅうしょ:['領収書'],
    うけつけ:['受付'],れんらくさき:['連絡先'],こうきょうこうつう:['公共交通'],
    りようあんない:['利用案内'],きんきゅうれんらく:['緊急連絡'],
    あんぜんかくにん:['安全確認'],じゅんびたいそう:['準備体操'],
    せいかつしゅうかん:['生活習慣'],ひなんけいろ:['避難経路'],
    こうつうきそく:['交通規則'],かいものりすと:['買い物リスト'],
    てんきよほう:['天気予報'],たいちょうかんり:['体調管理'],
    じかんかんり:['時間管理'],ことばのれんしゅう:['言葉の練習'],
    きんきゅうじたい:['緊急事態'],いりょうきかん:['医療機関'],
    びょういんよやく:['病院予約'],しゅうだんかつどう:['集団活動'],
    ちいきこうりゅう:['地域交流'],たいおうほうほう:['対応方法'],
    りょうかいしました:['了解しました']
  };
  // Each copy prompt is a complete, meaningful term of four characters or less.
  // Do not cut the middle of a long expression: truncated fragments are poor
  // writing exercises, especially for people with aphasia.
  var COPY_TARGETS = (
    '山 川 水 木 花 空 雨 手 足 人 日 月 本 田 口 目 耳 火 犬 猫 ' +
    '家 道 駅 鍵 靴 傘 魚 鳥 星 朝 夜 春 夏 秋 冬 ' +
    '名前 電話 時計 食事 財布 電車 机 学校 病院 文字 数字 ' +
    '青空 朝日 夕日 秋風 春雨 雨雲 冬空 大雨 小雨 水道 山道 川岸 ' +
    '新聞 郵便 旅行 家族 仕事 買物 料理 服薬 休憩 活動 会話 安心 安全 ' +
    '説明 相談 確認 連絡 予定 約束 時間 音読 発音 練習 記録 達成 ' +
    '笑顔 元気 感謝 挨拶 睡眠 気分 食材 受付 交通 運転 店員 車内 ' +
    '薬局 診察 電池 充電 時計台 改札口 診察券 予約日 生活費 日用品'
  ).trim().split(/\s+/);
  if (COPY_TARGETS.length < 100 || new Set(COPY_TARGETS).size < 100 ||
      COPY_TARGETS.some(function (t) { return Array.from(t).length > 4; })) {
    throw new Error('VETA11写字の語彙が不正です: ' + COPY_TARGETS.length);
  }
  if (root.KotobaCopyQuestionBank && Array.isArray(root.KotobaCopyQuestionBank.words)) {
    COPY_TARGETS.forEach(function (word) {
      if (root.KotobaCopyQuestionBank.words.indexOf(word) < 0) root.KotobaCopyQuestionBank.words.push(word);
    });
  }

  function distractors(item, index, count, exclude) {
    var out = [];
    for (var offset = 11; out.length < count && offset < 110; offset += 7) {
      var choice = items[(index + offset) % items.length].word;
      if (choice !== item.word && !(exclude && exclude(choice)) && out.indexOf(choice) < 0) out.push(choice);
    }
    return out;
  }
  function simpleSpeech(prompt, text) {
    return {question:'お手本を聞いて、無理のないペースで声に出しましょう。',prompt:prompt,
      voiceText:text,answer:'できた',choices:['できた','もう一度'],hint:'急がず、息を整えてから練習しましょう。'};
  }
  function kanaMora(text) {
    var chars = Array.from(text), list = [];
    chars.forEach(function (ch) {
      if (/[ゃゅょャュョァィゥェォ]/.test(ch) && list.length) list[list.length - 1] += ch;
      else list.push(ch);
    });
    return list;
  }
  function pickPicture(index, id) {
    var bank = root.QUESTIONS[id] || [];
    var visual = bank.filter(function (x) { return !!x.image || !!x.choices; });
    return visual.length ? visual[index % visual.length] : bank[index % bank.length];
  }
  // Each expanded question explains *its own* target, not a genre-wide slogan.
  // Reuse only verified vocabulary meanings and the actual question/choice data.
  function explanationFor(id, q, item, letter, mora, isTrue, definition) {
    var word=item.word, clue=item.clue, sentence=item.sentence;
    var target=String(q.answer || '');
    if (id === 'tf') return isTrue
      ? '「'+word+'」は「'+clue+'」のことです。問題文も同じ意味なので「○」です。'
      : '「'+word+'」は本来「'+clue+'」のことです。問題文の「'+definition+'」とは意味が違うため「×」です。';
    if (id === 'sound') return '「'+word+'」には、はじめに「'+letter+'」の音が入ります。選択肢を一つずつ声に出して、その音があるか比べましょう。';
    if (id === 'mora') return '「'+word+'」は「'+mora.join('・')+'」と区切れます。区切りが'+mora.length+'つあるので、答えは「'+mora.length+'拍」です。';
    if (id === 'anagram') return '並んでいる文字を「'+Array.from(word).join('→')+'」の順につなぐと「'+word+'」になります。「'+clue+'」を意味する言葉です。';
    if (id === 'cue' || id === 'localAIConversation') return '「'+clue+'」という特徴に合う言葉は「'+word+'」です。はじめの音は「'+Array.from(word)[0]+'」です。';
    if (id === 'fill' || id === 'kotobaQuestClassic') return '空欄に「'+word+'」を入れると、意味が通ります。例：「'+sentence+'」。「'+word+'」は'+clue+'を表します。';
    if (id === 'copy') return '見本は「'+target+'」です。「'+Array.from(target).join('・')+'」の文字を、順番と形を確認しながら書き写します。';
    if (id === 'stepup') return '単語「'+word+'」を言ったあと、「'+sentence+'」まで続けて練習します。単語から文章に広げる課題です。';
    if (id === 'sentenceRhythm') return '今回読む文章は「'+sentence+'」です。意味のまとまりを意識し、句点まで落ち着いて読みます。';
    if (id === 'repeat') return '今回のお手本は「'+String(q.voiceText || word)+'」です。音の順番を聞いてから、同じ言葉を復唱する練習です。';
    if (id === 'mouth' || id === 'accent') return '今回声に出す言葉は「'+word+'」です。お手本と口の動きや抑揚を比べ、無理のない速さで練習します。';
    if (id === 'voiceRead') return '今回読む文字は「'+String(q.prompt||word)+'」です。画面の文字と読み上げた言葉が合っているか確認します。';
    if (id === 'listen') return '問題の音声で示している言葉は「'+target+'」です。'+String(q.hint || '音と選択肢を対応させます。');
    if (id === 'instruction') return '音声の指示に合う動作は「'+target+'」です。'+String(q.hint || '指示に含まれる動きを確かめます。');
    if (id === 'matching') return '示された文字と意味が合うカードは「'+target+'」です。'+String(q.hint || '絵と文字の対応を確認します。');
    if (id === 'naming') return 'この絵の名前は「'+target+'」です。'+String(q.hint || '絵の特徴を見て名前を思い出しましょう。');
    if (id === 'gesture') return '示された場面・動作に対応する答えは「'+target+'」です。'+String(q.hint || '人物の動きを一つずつ確かめます。');
    if (id === 'board' || id === 'roleplay' || id === 'aac') return '今回の生活場面では「'+target+'」を使って伝えます。'+String(q.hint || q.question || '状況に合う言葉を選びます。');
    return '「'+target+'」が今回の答えです。'+String(q.hint || q.question || '問題の内容をもう一度確認しましょう。');
  }
  function questionFor(id, item, i) {
    var word = item.word, clue = item.clue, sentence = item.sentence;
    var q = null;
    var soundLetter = '', syllables = [], isTrue = true, definition = '';
    if (id === 'mouth') q = simpleSpeech('口の動きを意識しながら「' + word + '」と言ってみましょう。', word);
    if (id === 'sound') {
      var sound = Array.from(word)[0];
      soundLetter = sound;
      q = {question:'「' + sound + '」の音が入っている言葉を選びましょう。',
        answer:word,choices:[word].concat(distractors(item,i,3,function(x){return x.indexOf(sound)>=0;})),hint:'「' + sound + '」の音を探しましょう。'};
    }
    if (id === 'stepup') q = simpleSpeech('単語「' + word + '」→ 短文「' + sentence + '」', word + '。' + sentence);
    if (id === 'repeat') q = simpleSpeech('お手本を最後まで聞いてから復唱しましょう。', i < 45 ? word : sentence);
    if (id === 'accent') q = simpleSpeech('「' + word + '」を、自然な抑揚で読みましょう。', word);
    if (id === 'sentenceRhythm') q = simpleSpeech('区切る場所を考えて読みましょう。「' + sentence + '」', sentence);
    if (id === 'voiceRead') q = {question:'表示された言葉をマイクに向かって読みましょう。',prompt:i<45?word:sentence,
      answer:i<45?word:sentence,voiceText:i<45?word:sentence,hint:'落ち着いて、文字を最後まで読んでください。'};
    if (id === 'mora') {
      var mora = kanaMora(word);
      syllables = mora;
      q = {question:'「' + word + '」の音の拍を数えましょう。',prompt:mora.join('・'),answer:mora.length + '拍',
        moraCount:mora.length,voiceText:word,choices:[mora.length+'拍'],hint:'小さい「ゃ・ゅ・ょ」は前の文字と合わせて一拍です。'};
    }
    if (id === 'anagram') q = {kind:'anagram',question:'文字を正しく並べて言葉を作りましょう。',
      answer:word,tokens:Array.from(word).reverse(),hint:clue + '。'};
    if (id === 'cue') q = {question:'ヒントから言葉を思い出しましょう。',answer:word,emoji:'💭',hint:clue,
      cues:[{label:'特徴のヒント',text:clue},{label:'最初の音',text:'「'+Array.from(word)[0]+'」から始まります。'},
        {label:'音の数',text:'約'+kanaMora(word).length+'拍の言葉です。'}]};
    if (id === 'tf') {
      isTrue = i % 2 === 0;
      definition = isTrue ? clue : items[(i+31)%items.length].clue;
      var statement = '「' + word + '」は、' + definition + 'です。';
      q = {kind:'true-false',question:'文の内容が正しいか考えましょう。',prompt:statement,statement:statement,
        answer:isTrue?'○':'×',hint:'例えば「'+sentence.replace(/[。！？]+$/,'')+'」。言葉の意味を考えましょう。'};
    }
    if (id === 'fill' || id === 'kotobaQuestClassic') {
      // The missing term is not disclosed by the prompt; the full example is a hint.
      var wording = sentence.replace(word, '（　）');
      // Kanji equivalents can hide the original kana target in the sentence.
      if (wording === sentence) wording = clue + 'は（　）です。';
      q = {question:id==='fill'?'文の空いているところに入る言葉を選びましょう。':clue+'はどれでしょう？',
        prompt:id==='fill'?wording:undefined,answer:word,
        choices:[word].concat(distractors(item,i,3)),hint:'意味が合う言葉を選びましょう。'};
    }
    if (id === 'localAIConversation') q = {question:'「'+clue+'」に合う言葉は何ですか？',answer:word,
      aliases:KANJI_ALIASES[word]||[],hint:'最初の音は「'+Array.from(word)[0]+'」です。',emoji:'💭'};
    if (id === 'copy') {
      var shorter = COPY_TARGETS[i];
      q = {kind:'tracing',question:'薄いお手本の文字をなぞって練習しましょう。',
        prompt:shorter,answer:shorter,hint:'一文字ずつ形と順番を見ましょう。'};
    }
    if (id === 'listen' || id === 'instruction' || id === 'matching' || id === 'naming' || id === 'gesture') {
      var src = pickPicture(i, id);
      if (src) {
        q = Object.assign({}, src);
        // Photos remain unchanged; each variation changes the auditory
        // context/attention step, without inventing unavailable image files.
        if (id === 'listen') {
          q.voiceText = i<35 ? src.answer : 'よく聞いてください。' + src.answer + 'の絵を選びましょう。';
          q.question = '音声を聞いて、合う絵を一つ選びましょう。';
        } else if (id === 'instruction') {
          q.voiceText = i<35 ? (src.voiceText || src.answer) : '動作をよく聞いてください。' + (src.voiceText || src.answer);
          q.question = '指示を聞いて、合う動作を選びましょう。';
        } else if (id === 'matching') {
          q.question = '文字を読み、合う絵のカードを選びましょう。';
        } else if (id === 'naming') {
          q.question = '絵をよく見て、名前を答えましょう。';
        } else if (id === 'gesture') {
          q.question = '写真の人物がしている動作を答えましょう。';
        }
      }
    }
    if (id === 'board' || id === 'roleplay' || id === 'aac') {
      var src2 = (root.QUESTIONS[id] || [])[i % (root.QUESTIONS[id] || []).length];
      if (src2) {
        q = Object.assign({}, src2);
        if (id === 'board') {
          q.question = '生活場面で適切なカードを選びましょう：' + (src2.prompt || src2.question);
          q.prompt = q.question;
        } else if (id === 'roleplay') {
          q.scene = (src2.scene || src2.prompt || '') + (i >= 50 ? ' あなたなら、どの言葉で伝えますか。' : '');
          q.prompt = q.scene;
        } else {
          q.prompt = (src2.prompt || src2.question || '') + (i >= 50 ? ' 相手に伝える言葉を選びましょう。' : '');
        }
      }
    }
    if (!q) return null;
    q.explanation = explanationFor(id,q,item,soundLetter,syllables,isTrue,definition);
    q.difficultyLevel = item.level;
    q.expansionVersion = 'veta11';
    q.practiceVariant = i+1;
    return q;
  }
  var targets = [
    'mouth','sound','stepup','repeat','mora','accent','sentenceRhythm','voiceRead',
    'listen','instruction','tf','matching','copy','anagram','naming','cue','fill',
    'gesture','board','roleplay','aac','kotobaQuestClassic'
  ];
  targets.forEach(function (id) {
    var bank = root.QUESTIONS[id];
    if (!Array.isArray(bank)) return;
    items.forEach(function (item, i) {
      var q = questionFor(id, item, i);
      if (q && (!Array.isArray(q.choices) || q.choices.length > 1 || id==='mora')) bank.push(q);
    });
    // Existing problems are kept in the pool and tagged with the nearest
    // progression band, rather than silently deleted.
    bank.forEach(function (q, i) {
      if (!q.difficultyLevel) q.difficultyLevel = Math.min(10, Math.max(1, Math.floor(i / Math.max(1,bank.length / 10)) + 1));
    });
    if (bank.length < 100) console.warn('[VETA11] 問題数を要点検:', id, bank.length);
  });
  // AI会話は自由会話のみ。旧一問一答の問題データは増やさない。
  root.KotobaV11Words = items.slice();
  root.KotobaV11QuestionStats = {vocabulary:items.length, activityCounts:targets.reduce(function (acc,id) {
    acc[id] = Array.isArray(root.QUESTIONS[id]) ? root.QUESTIONS[id].length : 0;
    return acc;
  }, {})};
})(window);
