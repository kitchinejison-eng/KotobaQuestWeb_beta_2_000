/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/training/reading-memory-mode.js
 * 役割：朗読・記憶課題の開始と戻る操作
 * 利用画面：index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
(function(){
  'use strict';
  if(window.__readingMemoryModeInstalled) return;
  window.__readingMemoryModeInstalled = true;

  function returnToMain(){
    try{
      window.location.replace('index.html#title');
    }catch(e){
      window.location.href='index.html#title';
    }
  }

  function openMode(storyId){
    storyId = storyId || '1';
    try{
      window.location.href = 'reading-memory.html?story=' + encodeURIComponent(storyId) + '&v=104';
    }catch(e){}
  }

  function bind(){
    var e=document.getElementById('readingMemoryModeBtn');
    if(e) e.addEventListener('click', openMode);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  window.__readingMemoryMode={open:openMode, returnToMain:returnToMain};
})();
