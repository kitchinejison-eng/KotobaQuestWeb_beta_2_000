/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/games/cat-word-race-integration.js
 * 役割：猫の言葉選び3Dの学習記録連携
 * 利用画面：cat-word-race.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ことばクエスト VETA24: 猫の言葉選び 3Dゲーム連携。
 * PC/ブラウザ版。記録・熟練度・メダル・連続記録を既存キーへ保存します。
 * 別画面でも同一オリジンの localStorage を共有します。
 */
(function (root) {
  'use strict';
  var ACTIVITY = 'catWordChoice';
  var RECORDS_KEY = 'aphasiaTrainingRecordsV4';
  var MEDALS_KEY = 'kotobaDungeonSaveV1';
  var runSerial = 0;
  var alreadyFinished = false;

  function selectedLevel() {
    return root.KotobaLevels ? root.KotobaLevels.get(ACTIVITY) : {
      selected: 1, unlocked: 1, selectedMastery: 0, levelPoints: [0]
    };
  }
  function setLevel(level) {
    if (root.KotobaLevels) return root.KotobaLevels.select(ACTIVITY, level);
    return {selected: 1, unlocked: 1};
  }
  function profile() {
    try {
      if (root.KotobaQuestUserProfile && root.KotobaQuestUserProfile.getCurrent)
        return root.KotobaQuestUserProfile.getCurrent();
      return JSON.parse(localStorage.getItem('kotobaquest_user_profile_v1') || '{}') || {};
    } catch (_) { return {}; }
  }
  function begin(level) {
    runSerial++;
    alreadyFinished = false;
    setLevel(level);
    if (root.KotobaUnifiedLearning)
      root.KotobaUnifiedLearning.begin('genres', '3Dゲーム', ACTIVITY);
    return runSerial;
  }
  function answer(question, correct) {
    if (root.KotobaUnifiedLearning)
      root.KotobaUnifiedLearning.recordAnswer('genres', {
        id: 'catword-' + question.prompt,
        prompt: question.prompt,
        answer: question.options[question.answer],
        difficultyLevel: selectedLevel().selected
      }, !!correct);
  }
  function awardMedals(score, total) {
    var reward = total > 0 && score === total ? 5 : score > 0 ? 1 : 0;
    if (!reward) return {medals: 0, saved: true};
    try {
      var data = JSON.parse(localStorage.getItem(MEDALS_KEY) || '{}') || {};
      data.medals = Math.max(0, Math.floor(Number(data.medals) || 0)) + reward;
      if (!Array.isArray(data.unlockedAvatarIds)) data.unlockedAvatarIds = [1, 2, 3, 4];
      if (!Array.isArray(data.unlockedOutfitIds)) data.unlockedOutfitIds = [];
      if (!Array.isArray(data.history)) data.history = [];
      localStorage.setItem(MEDALS_KEY, JSON.stringify(data));
      return {medals: reward, saved: true};
    } catch (err) {
      console.warn('猫の言葉選び：メダルを保存できませんでした', err);
      return {medals: 0, saved: false};
    }
  }
  function saveRecord(payload, mastery, adaptive) {
    try {
      var at = new Date(), began = new Date(payload.startedAt || at);
      if (!Number.isFinite(began.getTime())) began = at;
      var p = profile(), score = payload.score, total = payload.total;
      var record = {
        id: at.getTime() + '-catword-' + Math.random().toString(36).slice(2, 8),
        date: at.getFullYear() + '-' + String(at.getMonth() + 1).padStart(2, '0') + '-' + String(at.getDate()).padStart(2, '0'),
        time: at.toLocaleTimeString('ja-JP', {hour:'2-digit',minute:'2-digit'}),
        startedAt: began.toISOString(), finishedAt: at.toISOString(),
        durationSec: Math.max(0, Math.round((at - began) / 1000)),
        category: 'ゲーム', genre: '3Dゲーム', activity: '猫の言葉選び',
        score: score, total: total, rate: total ? Math.round(score / total * 100) : 0,
        kind: 'catWordChoice3D', activityId: ACTIVITY,
        difficultyLevel: mastery ? mastery.level : selectedLevel().selected,
        masteryBefore: mastery ? mastery.before : 0,
        masteryAfter: mastery ? mastery.points : 0,
        userProfileId: p.profileId || 'unconfigured',
        userName: p.displayName || '名前未登録',
        userCode: p.recordCode || '',
        questionResults: payload.answers.map(function (a, i) {
          return {
            number: i + 1, question: a.prompt,
            given: a.selected, answer: a.right,
            correct: !!a.success, status: a.success ? '正解' : '不正解',
            explanation: a.explain,
            improvement: a.success ? '' : a.explain,
            answerMode: '3d-gate'
          };
        })
      };
      if (adaptive) record.adaptive = adaptive;
      var list = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
      if (!Array.isArray(list)) list = [];
      list.push(record);
      list.sort(function (a, b) { return String(a.finishedAt).localeCompare(String(b.finishedAt)); });
      localStorage.setItem(RECORDS_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      console.warn('猫の言葉選び：トレーニング記録を保存できませんでした', err);
      return false;
    }
  }
  function finish(payload) {
    if (alreadyFinished) return null;
    alreadyFinished = true;
    var total = Math.max(0, Number(payload.total) || 0);
    var score = Math.max(0, Math.min(total, Number(payload.score) || 0));
    var rate = total ? Math.round(score / total * 100) : 0;
    var mastery = root.KotobaLevels ? root.KotobaLevels.finish(ACTIVITY, rate, true, total) : null;
    var adaptive = root.KotobaUnifiedLearning ? root.KotobaUnifiedLearning.finish('genres', {
      genre: '3Dゲーム', activity: ACTIVITY, score: score, total: total
    }) : null;
    var saved = saveRecord({startedAt:payload.startedAt, answers:payload.answers || [], score:score, total:total}, mastery, adaptive);
    var award = awardMedals(score, total);
    if (root.KotobaDailyStreak) root.KotobaDailyStreak.finish('catDailyStreak');
    return {mastery: mastery, medals: award.medals, recordSaved: saved, medalSaved: award.saved};
  }
  root.KotobaCatRaceIntegration = {
    activityId: ACTIVITY, getProgress: selectedLevel,
    setLevel: setLevel, begin: begin, answer: answer, finish: finish
  };
})(window);
