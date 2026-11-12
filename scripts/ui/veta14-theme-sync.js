/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/ui/veta14-theme-sync.js
 * 役割：複数画面で同じテーマ色を使用する処理
 * 利用画面：reading-memory.html,kotoba-dungeon.html,print-drills.html,pictogram-3d.html,kotoba-quest-ud.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* Small shared theme reader. Main settings own writes to the same key. */
(function(){'use strict';try{var t=localStorage.getItem('kotobaquest_theme_v3')||'blue';if(['blue','red','yellow','green','purple'].indexOf(t)<0)t='blue';document.body.setAttribute('data-theme',t);document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=({blue:'#1976d2',red:'#c93d55',yellow:'#b68208',green:'#19875b',purple:'#7550b5'})[t];}catch(_){}})();
