/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/games/shiba-burger-integration.js
 * 役割：独立R4しばバーガーと学習記録の接続
 * 利用画面：shiba-burger-r4/index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA30: しばバーガーの学習記録・Lv・メダル・連続記録連携 */
(function(root){
 'use strict';
 const ACTIVITY='shibaBurger',RECORDS_KEY='aphasiaTrainingRecordsV4',DUNGEON_KEY='kotobaDungeonSaveV1';
 let finished=false;
 function getProfile(){
  try{if(root.KotobaQuestUserProfile?.getCurrent)return root.KotobaQuestUserProfile.getCurrent()||{};
   return JSON.parse(localStorage.getItem('kotobaquest_user_profile_v1')||'{}')||{};
  }catch(_){return {}}
 }
 function begin(){
  finished=false;
  if(root.KotobaUnifiedLearning)root.KotobaUnifiedLearning.begin('genres','3Dゲーム',ACTIVITY);
 }
 function answer(question,correct,given){
  if(root.KotobaUnifiedLearning)root.KotobaUnifiedLearning.recordAnswer('genres',{
   id:'shiba-burger-'+question.prompt,prompt:question.prompt,answer:question.right,
   given,difficultyLevel:root.KotobaLevels?root.KotobaLevels.get(ACTIVITY).selected:1
  },correct);
 }
 function medalsFor(score,total){
  const count=score===total&&total>0?5:score>0?1:0;
  if(!count)return {medals:0,saved:true};
  try{
   const saved=JSON.parse(localStorage.getItem(DUNGEON_KEY)||'{}')||{};
   saved.medals=Math.max(0,Math.floor(Number(saved.medals)||0))+count;
   if(!Array.isArray(saved.unlockedAvatarIds))saved.unlockedAvatarIds=[1,2,3,4];
   if(!Array.isArray(saved.unlockedOutfitIds))saved.unlockedOutfitIds=[];
   if(!Array.isArray(saved.history))saved.history=[];
   localStorage.setItem(DUNGEON_KEY,JSON.stringify(saved));
   return {medals:count,saved:true};
  }catch(e){console.warn('しばバーガー：メダル保存エラー',e);return {medals:0,saved:false}}
 }
 function saveRecord(payload,mastery,adaptive){
  try{
   const date=new Date(),began=new Date(payload.startedAt||date),started=Number.isFinite(began.getTime())?began:date;
   const profile=getProfile(),score=payload.score,total=payload.total;
   const record={
    id:date.getTime()+'-shibaburger-'+Math.random().toString(36).slice(2,8),
    date:date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0'),
    time:date.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
    startedAt:started.toISOString(),finishedAt:date.toISOString(),durationSec:Math.max(0,Math.round((date-started)/1000)),
    category:'ゲーム',genre:'3Dゲーム',activity:'しばバーガー｜注文おぼえてクイズ',kind:'shibaBurgerMemory',activityId:ACTIVITY,
    score,total,rate:total?Math.round(score/total*100):0,bestCombo:payload.bestCombo||0,
    difficultyLevel:mastery?.level??(root.KotobaLevels?root.KotobaLevels.get(ACTIVITY).selected:1),
    masteryBefore:mastery?.before??0,masteryAfter:mastery?.points??0,
    userProfileId:profile.profileId||'unconfigured',userName:profile.displayName||'名前未登録',userCode:profile.recordCode||'',
    questionResults:(payload.answers||[]).map((a,i)=>({
     number:i+1,question:a.prompt,given:a.selected,answer:a.right,correct:!!a.success,
     status:a.success?'正解':'不正解',explanation:a.explain,improvement:a.success?'':a.explain,
     wrongAttempts:a.wrongAttempts||0,usedHint:!!a.usedHint,answerMode:'burger-order-choice'
    }))
   };
   if(adaptive)record.adaptive=adaptive;
   let records=JSON.parse(localStorage.getItem(RECORDS_KEY)||'[]');if(!Array.isArray(records))records=[];
   records.push(record);records.sort((a,b)=>String(a.finishedAt).localeCompare(String(b.finishedAt)));
   localStorage.setItem(RECORDS_KEY,JSON.stringify(records));return true;
  }catch(e){console.warn('しばバーガー：記録保存エラー',e);return false}
 }
 function finish(payload){
  if(finished)return null;finished=true;
  const total=Math.max(0,Number(payload.total)||0),score=Math.max(0,Math.min(total,Number(payload.score)||0)),rate=total?Math.round(score/total*100):0;
  const mastery=root.KotobaLevels?root.KotobaLevels.finish(ACTIVITY,rate,true,total):null;
  const adaptive=root.KotobaUnifiedLearning?root.KotobaUnifiedLearning.finish('genres',{genre:'3Dゲーム',activity:ACTIVITY,score,total}):null;
  const recordSaved=saveRecord({...payload,score,total},mastery,adaptive),award=medalsFor(score,total);
  if(root.KotobaDailyStreak)root.KotobaDailyStreak.finish('shibaBurgerDailyStreak');
  return {mastery,medals:award.medals,medalSaved:award.saved,recordSaved};
 }
 root.KotobaShibaBurgerIntegration={activityId:ACTIVITY,begin,answer,finish};
})(window);
