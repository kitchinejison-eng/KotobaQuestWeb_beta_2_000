/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/audio/kotoba-audio-common-r5.js
 * 役割：ゲームをまたぐ効果音再生と音量の共通処理
 * 利用画面：reading-memory.html,index.html,cat-word-puzzle.html,shiba-burger-r4/index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ことばクエスト ver1.2.0 R5
 * ローカル動作の各ミニゲームと朗読で共通のSE音量を利用します。
 * 効果音のON/OFF、SE/BGM/TTSの個別音量、全体音量を尊重します。
 * 音声合成(TTS)とは別の短い波形で、聴覚指示を妨げない控えめな音です。
 */
(function(root){
 'use strict';
 var ctx=null,lastKind='',lastTime=0;
 var sequences={
  tap:[[560,.07,0]],confirm:[[590,.09,0],[750,.11,.07]],
  start:[[460,.10,0],[630,.13,.10]],
  correct:[[560,.12,0],[720,.15,.12]],
  wrong:[[310,.10,0],[240,.14,.11]],
  finish:[[510,.12,0],[650,.15,.12],[830,.18,.25]],
  save:[[530,.09,0],[700,.12,.10]],
  hint:[[580,.10,0]]
 };
 function readConfig(){
  var c={se:100,bgm:100,tts:100,seOn:true,ttsOn:true,rate:100};
  try{var raw=JSON.parse(localStorage.getItem('kotobaquest_audio_v86')||'{}');
   if(raw && typeof raw==='object')Object.assign(c,raw);}catch(_){}
  return c;
 }
 function clamp(v,def){var n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):def;}
 function master(){try{var x=localStorage.getItem('kotobaquest_volume_v3');return x===null?.6:clamp(Number(x)/100,.6);}catch(_){return .6;}}
 function seLevel(){var cfg=readConfig();return cfg.seOn===false?0:master()*clamp(Number(cfg.se)/100,1);}
 function voiceLevel(){var cfg=readConfig();return cfg.ttsOn===false?0:master()*clamp(Number(cfg.tts)/100,1);}
 function voiceRate(){var cfg=readConfig();return Math.max(.65,Math.min(1.3,Number(cfg.rate)/100||1));}
 function play(kind){
  var seq=sequences[kind];if(!seq)return false;
  var level=seLevel();if(level<=0)return true;
  var t=Date.now();if(lastKind===kind&&t-lastTime<160)return true;lastKind=kind;lastTime=t;
  try{
   var C=root.AudioContext||root.webkitAudioContext;if(!C)return false;
   if(!ctx)ctx=new C();if(ctx.state==='suspended'){var pr=ctx.resume();if(pr?.catch)pr.catch(function(){});}
   var now=ctx.currentTime,volume=Math.min(.065,level*(kind==='wrong'?.035:.05));
   seq.forEach(function(note){
    var osc=ctx.createOscillator(),gain=ctx.createGain(),st=now+note[2];
    osc.type='sine';osc.frequency.setValueAtTime(note[0],st);
    gain.gain.setValueAtTime(.0001,st);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),st+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,st+note[1]);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(st);osc.stop(st+note[1]+.02);
   });return true;
  }catch(_){return false;}
 }
 root.KotobaSharedSFX={play:play,seLevel:seLevel,voiceLevel:voiceLevel,voiceRate:voiceRate};
})(window);
