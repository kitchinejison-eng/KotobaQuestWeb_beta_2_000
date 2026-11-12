/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/games/cat-word-puzzle-integration.js
 * 役割：猫パズルの学習記録・メダルとの連携
 * 利用画面：cat-word-puzzle.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA28 — 猫のことばパズルを既存の学習記録・熟練度・メダルへ連携する。 */
(function (root) {
  'use strict';
  const ACTIVITY = 'catWordPuzzle';
  const RECORDS_KEY = 'aphasiaTrainingRecordsV4';
  const DUNGEON_KEY = 'kotobaDungeonSaveV1';
  let finished = false;

  function getProgress() {
    return root.KotobaLevels ? root.KotobaLevels.get(ACTIVITY) : {selected:1,unlocked:1,selectedMastery:0};
  }
  function setLevel(level) {
    return root.KotobaLevels ? root.KotobaLevels.select(ACTIVITY,level) : {selected:1,unlocked:1};
  }
  function getProfile() {
    try {
      if(root.KotobaQuestUserProfile?.getCurrent)return root.KotobaQuestUserProfile.getCurrent() || {};
      return JSON.parse(localStorage.getItem('kotobaquest_user_profile_v1') || '{}') || {};
    } catch (_) { return {}; }
  }
  function begin(level) {
    finished = false;
    setLevel(level);
    if(root.KotobaUnifiedLearning)
      root.KotobaUnifiedLearning.begin('genres','3Dゲーム',ACTIVITY);
  }
  function answer(question,correct,given,wrongAttempts) {
    if(root.KotobaUnifiedLearning)
      root.KotobaUnifiedLearning.recordAnswer('genres',{
        id:'catpuzzle-'+question[1],prompt:question[3],answer:question[1],
        given:given,wrongAttempts:wrongAttempts,difficultyLevel:getProgress().selected
      },!!correct);
  }
  function awardMedals(score,total) {
    const amount=total>0&&score===total?5:score>0?1:0;
    if(!amount)return {medals:0,saved:true};
    try {
      const saved=JSON.parse(localStorage.getItem(DUNGEON_KEY)||'{}')||{};
      saved.medals=Math.max(0,Math.floor(Number(saved.medals)||0))+amount;
      if(!Array.isArray(saved.unlockedAvatarIds))saved.unlockedAvatarIds=[1,2,3,4];
      if(!Array.isArray(saved.unlockedOutfitIds))saved.unlockedOutfitIds=[];
      if(!Array.isArray(saved.history))saved.history=[];
      localStorage.setItem(DUNGEON_KEY,JSON.stringify(saved));
      return {medals:amount,saved:true};
    } catch (error) { console.warn('猫のことばパズル：メダル保存に失敗',error); return {medals:0,saved:false}; }
  }
  function saveRecord(payload,mastery,adaptive) {
    try {
      const date=new Date(),began=new Date(payload.startedAt||date);
      const started=Number.isFinite(began.getTime())?began:date;
      const p=getProfile(),score=payload.score,total=payload.total;
      const record={
        id:date.getTime()+'-catpuzzle-'+Math.random().toString(36).slice(2,8),
        date:date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0'),
        time:date.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
        startedAt:started.toISOString(),finishedAt:date.toISOString(),durationSec:Math.max(0,Math.round((date-started)/1000)),
        category:'ゲーム',genre:'3Dゲーム',activity:'猫のことばパズル',kind:'catWordPuzzle3D',activityId:ACTIVITY,
        score,total,rate:total?Math.round(score/total*100):0,
        puzzleMode:'trace-and-fall',puzzlePoints:Math.max(0,Number(payload.puzzlePoints)||0),
        bestCombo:Math.max(0,Number(payload.bestCombo)||0),
        difficultyLevel:mastery?.level??getProgress().selected,
        masteryBefore:mastery?.before??0,masteryAfter:mastery?.points??0,
        userProfileId:p.profileId||'unconfigured',userName:p.displayName||'名前未登録',userCode:p.recordCode||'',
        questionResults:payload.answers.map((a,i)=>({
          number:i+1,question:a.prompt,given:a.selected,answer:a.right,correct:!!a.success,
          status:a.success?'正解':'不正解',explanation:a.explain,
          improvement:a.success?'':a.explain,wrongAttempts:a.wrongAttempts,answerMode:'puzzle-tiles'
        }))
      };
      if(adaptive)record.adaptive=adaptive;
      let list=JSON.parse(localStorage.getItem(RECORDS_KEY)||'[]');if(!Array.isArray(list))list=[];
      list.push(record);list.sort((a,b)=>String(a.finishedAt).localeCompare(String(b.finishedAt)));
      localStorage.setItem(RECORDS_KEY,JSON.stringify(list));return true;
    } catch(error){console.warn('猫のことばパズル：学習記録保存に失敗',error);return false}
  }
  function finish(payload) {
    if(finished)return null;
    finished=true;
    const total=Math.max(0,Number(payload.total)||0),score=Math.max(0,Math.min(total,Number(payload.score)||0));
    const rate=total?Math.round(score/total*100):0;
    const mastery=root.KotobaLevels?root.KotobaLevels.finish(ACTIVITY,rate,true,total):null;
    const adaptive=root.KotobaUnifiedLearning?root.KotobaUnifiedLearning.finish('genres',{
      genre:'3Dゲーム',activity:ACTIVITY,score,total
    }):null;
    const recordSaved=saveRecord({startedAt:payload.startedAt,answers:payload.answers||[],score,total,
      puzzlePoints:payload.puzzlePoints,bestCombo:payload.bestCombo},mastery,adaptive);
    const award=awardMedals(score,total);
    if(root.KotobaDailyStreak)root.KotobaDailyStreak.finish('catPuzzleDailyStreak');
    return {mastery,medals:award.medals,recordSaved,medalSaved:award.saved};
  }
  root.KotobaCatPuzzleIntegration={activityId:ACTIVITY,getProgress,setLevel,begin,answer,finish};
})(window);
