/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/audio/kotoba-sound-design-v19.js
 * 役割：ボタン・正解・不正解などの効果音制御
 * 利用画面：index.html,cat-word-puzzle.html,kotoba-card-game.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ことばクエスト VETA23: 共通UI・神経衰弱用の短いオリジナルSE。
 * 効果音OFF・個別音量・全体音量を守り、読み上げを妨げにくい控えめな音量に統一。
 */
(function (root) {
  'use strict';
  var context = null, lastPlay = 0, lastKind = '';
  var notes = {
    tap: [[540, 0.035, 0], [690, 0.035, .035]],
    navigate: [[440, .045, 0], [610, .055, .042]],
    confirm: [[550, .05, 0], [740, .065, .060]],
    start: [[490, .055, 0], [640, .065, .052], [850, .075, .113]],
    hint: [[550, .050, 0], [830, .060, .065]],
    save: [[460, .050, 0], [680, .075, .060]],
    cardFlip: [[470, .055, 0], [650, .038, .036]],
    cardMatch: [[555, .095, 0], [740, .105, .065], [940, .14, .145]],
    cardCombo: [[620, .085, 0], [830, .11, .080], [1040, .13, .18], [1240, .16, .28]],
    cardMismatch: [[350, .075, 0], [260, .13, .068]],
    turnPlayer: [[510, .06, 0], [700, .09, .070]],
    turnCpu: [[370, .055, 0], [470, .085, .065]],
    win: [[520, .11, 0], [660, .12, .12], [790, .16, .25], [1040, .23, .39]],
    lose: [[400, .12, 0], [330, .15, .10], [275, .18, .23]],
    draw: [[440, .10, 0], [550, .10, .12], [440, .12, .24]]
  };
  var cueGain={tap:.035,navigate:.041,confirm:.044,start:.049,hint:.040,save:.043,
    cardFlip:.031,cardMatch:.048,cardCombo:.05,cardMismatch:.039,turnPlayer:.034,turnCpu:.030,
    win:.055,lose:.041,draw:.043};
  function seVolume() {
    if (root.KotobaAudio && root.KotobaAudio.isSeOn && !root.KotobaAudio.isSeOn()) return 0;
    if (typeof root.__appMasterVolume === 'number') return Math.max(0, Math.min(1, root.__appMasterVolume));
    var level = .6;
    try { level = Number(localStorage.getItem('kotobaquest_volume_v3') || 60) / 100; } catch (_) {}
    try {
      var prefs = JSON.parse(localStorage.getItem('kotobaquest_audio_v86') || '{}');
      if (prefs.seOn === false) return 0;
      if (prefs.se != null) level *= Math.max(0, Math.min(1, Number(prefs.se) / 100));
    } catch (_) {}
    return Math.max(0, Math.min(1, level));
  }
  function play(kind) {
    var sequence = notes[kind];
    if (!sequence) return false;
    var volume = seVolume();
    if (volume <= 0) return true;
    var now = Date.now();
    // 同じ効果音の連打を間引く。一方、カードをめくった直後の一致音は再生する。
    if (lastKind === kind && now - lastPlay < 135) return true;
    if ((kind === 'tap' || kind === 'confirm') && now - lastPlay < 65) return true;
    lastPlay = now; lastKind = kind;
    try {
      var C = root.AudioContext || root.webkitAudioContext;
      if (!C) return false;
      context = context || new C();
      if (context.state === 'suspended') {
        var promise = context.resume();
        if (promise && promise.catch) promise.catch(function () {});
      }
      var start = context.currentTime;
      sequence.forEach(function (part) {
        var when = start + part[2], oscillator = context.createOscillator();
        var gain = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = part[0];
        gain.gain.setValueAtTime(.0001, when);
        gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume * (cueGain[kind] || .04)), when + .008);
        gain.gain.exponentialRampToValueAtTime(.0001, when + part[1]);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(when); oscillator.stop(when + part[1] + .015);
      });
      return true;
    } catch (_) { return false; }
  }
  root.KotobaSoundDesign = {play:play};
  // Add a distinct but restrained cue to navigation, returning, save and opening
  // a task.  Answers use their own correct/wrong cues and are intentionally excluded.
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var button = target.closest('button');
    if (!button) {
      var anchor = target.closest('a');
      if (anchor && anchor.matches('.cg-back, .cg-link')) play('navigate');
      return;
    }
    if (button.disabled || button.closest('#game') || button.closest('#answerArea')) return;
    var id = button.id || '';
    if (id === 'settingsSaveBtn') play('save');
    else if (id === 'titleStartBtn' || id === 'startSelectedBtn') play('start');
    else if (button.matches('.back-button, #homeToTitleBtn, #resultHomeBtn, #recordsHomeBtn')) play('navigate');
    else if (button.matches('.menu-button, .category-card, .activity-card, .secondary-button, .primary-button')) play('confirm');
  }, true);
})(window);
