/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/system/encoding-safe.js
 * 役割：UTF-8表示と文字化け対策
 * 利用画面：index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
(function(){
  'use strict';
  /*
   * ブラウザ版はHTML meta charset=UTF-8とUTF-8保存済みのアセットで統一しています。
   * 以前の「文字修復」処理は、正常な日本語まで書き換える可能性があるため使用しません。
   */
  window.__kotobaEncodingReady = true;
})();
