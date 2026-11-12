/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/3d/3d-loading-r4.js
 * 役割：3Dを読み込む間の進捗・待機表示
 * 利用画面：共通モジュール／必要時のみ参照
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* Shared Android-safe loading panel for existing 3D models. */
(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const controllers=new Map();
  function get(id){
    if(controllers.has(id))return controllers.get(id);
    const root=byId(id);
    if(!root)return null;
    const status=root.querySelector('p[id$="Status"]');
    const bar=root.querySelector('.kq3d-bar');
    const retry=root.querySelector('.kq3d-retry');
    const next=root.querySelector('.kq3d-continue');
    const controller={root,status,bar,retry,next,finished:false,timer:null};
    retry?.addEventListener('click',()=>location.reload());
    next?.addEventListener('click',()=>{root.hidden=true;controller.finished=true;clearTimeout(controller.timer)});
    controller.timer=setTimeout(()=>{
      if(!controller.finished)window.KQ3DLoading.fail(id,'読み込みに時間がかかっています。再読み込みするか、このまま進めます。');
    },35000);
    controllers.set(id,controller);
    return controller;
  }
  function progress(id,event,label){
    const c=get(id);if(!c||c.finished)return;
    if(label&&c.status)c.status.textContent=label;
    if(!event||!event.lengthComputable||!event.total)return;
    const percent=Math.min(95,Math.max(0,Math.round(event.loaded/event.total*95)));
    c.bar?.classList.add('kq3d-determinate');
    if(c.bar)c.bar.style.width=percent+'%';
    c.root.setAttribute('aria-label','3Dモデルを読み込み中 '+percent+'%');
  }
  function ready(id){
    const c=get(id);if(!c)return;
    c.finished=true;clearTimeout(c.timer);
    if(c.bar){c.bar.classList.add('kq3d-determinate');c.bar.style.width='100%'}
    c.root.hidden=true;
  }
  function fail(id,message){
    const c=get(id);if(!c||c.finished)return;
    clearTimeout(c.timer);
    if(c.status)c.status.textContent=message||'3Dの準備に失敗しました。';
    if(c.bar){c.bar.classList.add('kq3d-determinate');c.bar.style.width='0%'}
    if(c.retry)c.retry.hidden=false;
    if(c.next)c.next.hidden=false;
  }
  window.KQ3DLoading={progress,ready,fail};
  document.querySelectorAll('.kq3d-loading').forEach(root=>get(root.id));
})();
