/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/audio/kotoba-sound-pack-v2.js
 * 役割：同梱SE/BGMの選択と再生
 * 利用画面：kotoba-dungeon.html,index.html,pictogram-3d.html,cat-word-puzzle.html,kotoba-card-game.html,kotoba-quest-ud.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ユーザー提供SE/BGM。音が再生できなくてもゲームを止めません。 */
(function (root) {
  'use strict';
  var files = {
    tap: 'sounds/tap.mp3', gacha: 'sounds/gacha-reward.mp3',
    clear: 'sounds/all-correct.mp3', record: 'sounds/record-saved.mp3',
    footsteps: 'sounds/footstep.mp3'
  };
  var pool = Object.create(null);
  // Balanced relative to speech. The user-controlled SE level remains master.
  // 共通設定に対して効果音ごとの差を均一化。通知が音声やBGMを覆わない値にする。
  var mixing = {tap:0.47,gacha:0.63,clear:0.62,record:0.47,footsteps:0.27};
  function play(kind) {
    if (!files[kind]) return false;
    var volume = root.__appMasterVolume;
    if (typeof volume !== 'number') {
      try { volume = Number(localStorage.getItem('kotobaquest_volume_v3') || 60) / 100; }
      catch (_) { volume = .6; }
      try {
        var options = JSON.parse(localStorage.getItem('kotobaquest_audio_v86') || '{}');
        if (options.seOn === false) volume = 0;
        else volume *= Math.max(0, Math.min(1, Number(options.se == null ? 100 : options.se) / 100));
      } catch (_) {}
    }
    volume = Math.max(0, Math.min(1, Number(volume) || 0));
    if (!volume || !root.Audio) return true;
    try {
      var audio = pool[kind] || (pool[kind] = new Audio(files[kind]));
      audio.volume = Math.max(0,Math.min(1,volume * (mixing[kind] || 0.8)));
      audio.currentTime = 0;
      var pending = audio.play();
      if (pending && pending.catch) pending.catch(function () {});
      return true;
    } catch (error) { return false; }
  }
  root.KotobaSoundPack = {play: play, files: Object.assign({}, files)};
})(window);
