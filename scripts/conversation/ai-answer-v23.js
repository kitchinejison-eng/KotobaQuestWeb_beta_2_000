/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/conversation/ai-answer-v23.js
 * 役割：AI回答の表記揺れ・別名判定
 * 利用画面：index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA23: AI会話・5問クイズ用の表記ゆれ判定。通信・外部ライブラリ不要。 */
(function (root) {
  'use strict';
  function normalize(value) {
    var text = String(value == null ? '' : value).normalize('NFKC').toLowerCase();
    // ひらがなとカタカナは同じ読みとして扱う（漢字は問題ごとの許容表記で比較）。
    text = text.replace(/[ァ-ヶ]/g, function (character) {
      return String.fromCharCode(character.charCodeAt(0) - 0x60);
    });
    text = text.replace(/[\s\u3000、。．,.!！?？「」『』（）()・･]/g, '');
    text = text.replace(/^(?:こたえは|答えは|これは|それは)/, '');
    text = text.replace(/(?:だとおもいます|だと思います|です|だよ|だ)$/,'');
    return text;
  }
  function accepted(question) {
    var terms = [question && question.answer].concat(question && Array.isArray(question.aliases) ? question.aliases : []);
    return Array.from(new Set(terms.map(normalize).filter(Boolean)));
  }
  function matches(question, input) {
    var candidate = normalize(input);
    return !!candidate && accepted(question).indexOf(candidate) !== -1;
  }
  root.KotobaAIAnswer = Object.freeze({normalize:normalize,accepted:accepted,matches:matches});
})(typeof window !== 'undefined' ? window : globalThis);
