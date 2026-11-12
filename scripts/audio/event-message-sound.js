/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/audio/event-message-sound.js
 * 役割：会話イベントで使用する効果音
 * 利用画面：index.html,opening-event.html,kotoba-quest-ud.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA19: dialogue SE follows the app's master + SE switches and levels. */
(function () {
  'use strict';
  var soundUrl = 'sounds/message-display-3.mp3';
  var pending = null;
  var active = [];
  function seVolume() {
    var volume = typeof window.__appMasterVolume === 'number' ? window.__appMasterVolume : 0.6;
    if (typeof window.__appMasterVolume !== 'number') {
      try {
        var user = JSON.parse(localStorage.getItem('kotobaquest_audio_v86') || '{}');
        if (user.seOn === false) return 0;
        var master = localStorage.getItem('kotobaquest_volume_v3');
        volume = (master === null ? 0.6 : Math.max(0,Math.min(1,Number(master)/100))) *
          Math.max(0,Math.min(1,Number(user.se == null ? 100 : user.se)/100));
      } catch (_) {}
    }
    return Math.max(0,Math.min(1,Number(volume)||0)) * 0.38;
  }
  function stopActive() {
    active.forEach(function (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    });
    active = [];
  }
  function playInstance(instance) {
    try {
      instance.volume=seVolume();
      if(instance.volume<=0){pending=null;return;}
      instance.currentTime = 0;
      var promise = instance.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () { if (pending === instance) pending = null; })
          .catch(function () { pending = instance; });
      }
    } catch (e) { pending = instance; }
  }
  function play() {
    // セリフを連続で進めても前の通知音と重ならないようにします。
    stopActive();
    pending = null;
    if(seVolume()<=0)return;
    var audio = new Audio(soundUrl);
    audio.preload = 'auto';
    audio.volume = seVolume();
    active.push(audio);
    audio.addEventListener('ended', function () {
      active = active.filter(function (item) { return item !== audio; });
    });
    playInstance(audio);
  }
  function stop() {
    stopActive();
    pending = null;
  }
  // 自動再生が制限される環境では、最初のユーザー操作後に直前の表示音を再試行します。
  document.addEventListener('pointerdown', function () {
    if (pending) {
      var audio = pending;
      pending = null;
      playInstance(audio);
    }
  }, { passive: true });
  window.KQEventMessageSound = { play: play, stop: stop };
})();
