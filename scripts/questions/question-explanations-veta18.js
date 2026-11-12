/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/questions/question-explanations-veta18.js
 * 役割：回答後に表示する問題別の解説・復習ポイント
 * 利用画面：index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA18: answer-specific reasons for both original and expanded exercises.
 * Uses the actual target / sentence / sound / answer; does not invent unseen
 * visual characteristics or give a clinical judgement on pronunciation. */
(function (root) {
  'use strict';
  function tidy(value) { return String(value == null ? '' : value).replace(/\s+/g, ' ').trim(); }
  function quote(value) { return '「' + tidy(value) + '」'; }
  function hint(q) {
    var h = tidy(q.hint || '');
    if (!h || /^(問題文と|意味が合う|正しい説明か|正しい言葉|一つずつ|答えを|ゆっくり|音声を聞いて)/.test(h)) return '';
    return h;
  }
  function explains(activity, q) {
    if (!q) return '';
    var direct = tidy(q.explanation || q.expText || q.expSpeech);
    if (direct) return direct;
    var id = tidy(activity || ''), answer = tidy(q.answer), prompt = tidy(q.prompt || q.statement);
    var note = hint(q), target = tidy(q.voiceText || q.prompt || answer);
    var noteAfter = note ? ' ' + note : '';

    if (id === 'tf' || q.kind === 'true-false') {
      if (/魚は空を飛びます/.test(prompt)) return '魚はふつう水の中で生活し、泳いで移動します。「空を飛びます」という説明は違うので、答えは「×」です。';
      if (/バナナは食べ物/.test(prompt)) return 'バナナは食べられる果物です。文の内容が合っているため、答えは「○」です。';
      if (/雨の日に傘を使います/.test(prompt)) return '傘は雨にぬれないために使う道具です。文の内容が合っているため、答えは「○」です。';
      return quote(prompt) + (answer === '×' ? 'は正しくない説明です。' : 'は正しい説明です。') + noteAfter + ' 答えは' + quote(answer) + 'です。';
    }
    if (id === 'mora' || q.moraCount) {
      var grouped = prompt && /[・･]/.test(prompt) ? prompt : Array.from(target).join('・');
      return quote(grouped) + 'と一音ずつ区切って数えます。区切りを確かめると' + quote(answer) + 'です。小さい「ゃ・ゅ・ょ」は前の音と合わせて一拍です。';
    }
    if (id === 'anagram' || q.kind === 'anagram') {
      return '提示された文字を' + quote(Array.from(answer).join('→')) + 'の順に並べると' + quote(answer) + 'になります。' + noteAfter;
    }
    if (id === 'copy' || q.kind === 'handwriting') {
      var copy = prompt || answer;
      return '今回の見本は' + quote(copy) + 'です。' + quote(Array.from(copy).join('・')) + 'の順番で、一文字ずつ形を見比べて書き写しましょう。';
    }
    if (q.navGuide || id === 'articulationNavigator') {
      return '今回の練習音は' + quote(answer) + 'です。' + tidy(q.navGuide || q.navSteps && q.navSteps.join(' ')) + ' ' + note;
    }
    if (id === 'sound') {
      var match = String(q.question || '').match(/[「『]([^」』]+)[」』]/);
      var sound = match ? match[1] : '';
      var focus = sound && sound.indexOf('・') < 0 ? '指定された音' + quote(sound) : '指定された音のグループ';
      return '答えの' + quote(answer) + 'を声に出し、' + focus + 'が含まれるか確かめます。' + noteAfter;
    }
    if (id === 'stepup') return '最初に単語を発音してから、' + quote(prompt || target) + 'の短文まで続けて言います。単語から文へ広げる練習です。';
    if (id === 'sentenceRhythm') return '今回読む文章は' + quote(prompt || target) + 'です。意味のまとまりを意識して、句点まで落ち着いて声に出します。' + noteAfter;
    if (id === 'repeat') return '今回のお手本は' + quote(target) + 'です。聞いた音の順番を保って同じ言葉を復唱します。' + noteAfter;
    if (id === 'accent') return '今回の言葉は' + quote(target) + 'です。お手本の抑揚を聞いてから、自分のペースで発音します。アクセントには地域差があります。';
    if (id === 'mouth') return '今回の口の運動・発声内容は' + quote(prompt || target) + 'です。' + noteAfter + ' 無理に動かさず、お手本と比べて練習します。';
    if (id === 'voiceRead') return '表示された' + quote(prompt || answer) + 'を、文字の順番に合わせて読みます。読んだ言葉と表示内容を確認しましょう。';
    if (id === 'listen') return '聞こえた言葉に合う答えは' + quote(answer) + 'です。' + noteAfter;
    if (id === 'instruction') return '指示に合う動作は' + quote(answer) + 'です。' + (prompt ? '指示文' + quote(prompt) + 'に注目します。' : '') + noteAfter;
    if (id === 'matching') return '文字' + quote(prompt || answer) + 'に対応する絵は' + quote(answer) + 'です。' + noteAfter;
    if (id === 'naming') return 'この絵・写真の名前は' + quote(answer) + 'です。' + noteAfter;
    if (id === 'cue') return 'ヒントに合う言葉は' + quote(answer) + 'です。' + (prompt ? '問題の特徴：' + prompt + '。' : '') + noteAfter;
    if (id === 'fill') {
      var completed = prompt.replace(/（[\s　]*）|\([\s　]*\)/, answer);
      return '空欄には' + quote(answer) + 'が入ります。' + (completed !== prompt ? '完成した文は' + quote(completed) + 'です。' : '') + noteAfter;
    }
    if (id === 'gesture') return '動作や身振りに合う答えは' + quote(answer) + 'です。' + noteAfter;
    if (id === 'board' || id === 'roleplay' || id === 'aac') {
      return '今回の場面では' + quote(answer) + 'を使って伝えます。' + (prompt ? '場面：' + prompt + '。' : '') + noteAfter;
    }
    return 'この問題の答えは' + quote(answer || target) + 'です。' + (prompt ? '問題の内容：' + prompt + '。' : '') + noteAfter;
  }
  // VETA19: the review is tied to the particular question AND the learner's
  // response.  Explanations are facts about the item, not guesses about why a
  // person made a mistake or a diagnosis of their speech.
  function review(activity, q, options) {
    if (!q) return '';
    var opts = options || {};
    var id = tidy(activity), answer = tidy(q.answer || q.target || q.prompt);
    var given = tidy(opts.given), prompt = tidy(q.statement || q.prompt || q.question);
    var comparison = given && given !== '__mic_correct__'
      ? '回答した' + quote(given) + 'と正解の' + quote(answer) + 'を見比べましょう。'
      : '正解の' + quote(answer) + 'をもう一度確かめましょう。';
    var action = '';
    if (id === 'tf' || q.kind === 'true-false') action = '文' + quote(prompt) + 'の内容が実際に正しいかを一つずつ確認します。';
    else if (id === 'mora' || q.moraCount) action = quote(q.prompt || answer) + 'を声に出して拍ごとに手を打ち、数と選択肢を比べましょう。';
    else if (id === 'anagram' || q.kind === 'anagram') action = quote(answer) + 'の文字を最初から一文字ずつ順番に並べ直しましょう。';
    else if (id === 'copy' || q.kind === 'handwriting') action = quote(q.prompt || answer) + 'の一文字ごとの形と順番を見本と見比べましょう。認識候補の一致は筆跡そのものの評価ではありません。';
    else if (id === 'listen') action = '読み上げられた言葉と' + quote(answer) + 'の音を比べ、最初と最後の音にも注目しましょう。';
    else if (id === 'instruction') action = '指示文' + quote(prompt) + 'の「何を」「どうする」を分けて、' + quote(answer) + 'を選ぶ理由を確かめましょう。';
    else if (id === 'matching' || id === 'naming') action = '今回の絵が表す' + quote(answer) + 'と選んだ言葉が一致するか確認しましょう。';
    else if (id === 'cue') action = '提示された特徴' + (prompt ? quote(prompt) : '') + 'と' + quote(answer) + 'の関係を確かめましょう。';
    else if (id === 'fill') action = '正解の' + quote(answer) + 'を空欄に入れて、文全体を読んでみましょう。';
    else if (id === 'sound' || id === 'repeat' || id === 'accent' || id === 'stepup' || id === 'voiceRead' || id === 'sentenceRhythm' || id === 'mouth' || id === 'articulationNavigator') action = '今回のお手本' + quote(q.voiceText || q.prompt || answer) + 'を聞いて、音の順番や口の動きを無理なく確認しましょう。';
    else if (id === 'board' || id === 'roleplay' || id === 'aac') action = '場面' + quote(prompt || q.hint || '今回の場面') + 'に合わせて、' + quote(answer) + 'という伝え方を確かめましょう。';
    else action = '問題' + quote(prompt || q.target || answer) + 'に戻り、正解を選ぶ手がかりを確認しましょう。';
    return (comparison + ' ' + explains(activity, q) + ' 復習の手順：' + action).slice(0, 500);
  }
  root.KotobaQuestionExplanations = Object.freeze({explain: explains, review: review});
})(typeof window !== 'undefined' ? window : globalThis);
