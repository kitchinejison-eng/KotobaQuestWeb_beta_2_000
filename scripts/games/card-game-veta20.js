/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/games/card-game-veta20.js
 * 役割：神経衰弱のCPU対戦・結果画面
 * 利用画面：kotoba-card-game.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ことばクエスト VETA23｜神経衰弱 CPU対戦、カード演出と共通形式の結果画面。 */
(function (root) {
  'use strict';
  var E = root.KotobaCardEngine;
  if (!E) return;
  var $ = function (id) { return document.getElementById(id); };
  var run = null, runId = 0, delayTimer = null, effectTimer = null;
  // CPUは公開されたカードしか記憶しません。Lv.に応じて思い出せる確率だけが変わります。
  var memoryStrength = [.15, .24, .33, .43, .54, .65, .76, .86, .94, 1];

  function secureStorageGet(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function pickNumber(value, fallback) { var n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function cleanup() {
    runId++;
    if (delayTimer !== null) { clearTimeout(delayTimer); delayTimer = null; }
    if (effectTimer !== null) { clearTimeout(effectTimer); effectTimer = null; }
    var burst = $('cgMatchBurst');
    if (burst) { burst.hidden = true; burst.textContent = ''; }
  }
  function later(action, ms) {
    var token = runId;
    delayTimer = setTimeout(function () {
      delayTimer = null;
      if (runId === token && run && !run.completed) action();
    }, ms);
  }
  function playCue(kind) {
    if (root.KotobaSoundDesign && root.KotobaSoundDesign.play(kind)) return;
    if (!root.KotobaSoundPack) return;
    var pack = {cardFlip:'tap',cardMatch:'record',cardCombo:'clear',cardMismatch:'tap',
      turnCpu:'footsteps',turnPlayer:'tap',win:'clear',lose:'record',draw:'record',start:'tap'};
    root.KotobaSoundPack.play(pack[kind] || 'tap');
  }
  function showOnly(id) { ['cgSetup','cgPlay','cgResult'].forEach(function (key) { $(key).hidden = key !== id; }); }
  function feedback(title, description, positive) {
    var el = $('cgFeedback');
    el.hidden = false; el.className = 'cg-feedback ' + (positive ? 'is-success' : 'is-error');
    el.textContent = '';
    var strong = document.createElement('strong'); strong.textContent = title;
    var p = document.createElement('p'); p.textContent = description;
    el.append(strong, p);
  }
  function readUrlSetup() {
    var url = new URL(root.location.href), pref = null;
    try {
      var prefs = JSON.parse(secureStorageGet('kotobaquest_genre_preferences_v14') || '{}');
      pref = prefs && prefs.cardGames;
    } catch (_) {}
    var passed = pickNumber(url.searchParams.get('count'), NaN);
    $('cgCount').value = String(E.countSetting(Number.isFinite(passed) ? passed : (pref && pref.count) || 5));
  }
  function populateLevels() {
    var select = $('cgLevel'); select.textContent = '';
    var progress = root.KotobaLevels ? root.KotobaLevels.get('cardMemory') : {unlocked:1,selected:1};
    for (var n = 1; n <= Math.max(1, progress.unlocked); n++) {
      var option = document.createElement('option'); option.value = String(n); option.textContent = 'Lv.' + n;
      select.appendChild(option);
    }
    select.value = String(progress.selected);
  }
  function buttonCard(item, index) {
    var button = document.createElement('button'); button.type = 'button';
    button.className = 'cg-card is-hidden'; button.setAttribute('aria-label', '裏向きカード ' + (index + 1));
    var inner = document.createElement('span'); inner.className = 'cg-card-inner';
    var back = document.createElement('span'); back.className = 'cg-card-back';
    back.setAttribute('aria-hidden', 'true');
    var symbol = document.createElement('span'); symbol.className = 'cg-card-symbol'; symbol.textContent = '✦';
    back.appendChild(symbol);
    var front = document.createElement('span'); front.className = 'cg-card-front';
    front.setAttribute('aria-hidden', 'true');
    var emoji = document.createElement('span'); emoji.className = 'cg-emoji'; emoji.textContent = item.emoji;
    front.appendChild(emoji); inner.append(back, front); button.appendChild(inner);
    return button;
  }
  function updateCombo() {
    var el = $('cgCombo');
    if (!el || !run) return;
    var visible = run.playerCombo >= 2;
    el.hidden = !visible;
    el.textContent = visible ? '✨ ' + run.playerCombo + 'ペア連続成功！　自己ベスト ' + run.bestCombo + '連続' : '';
    el.classList.toggle('is-celebrating', visible);
  }
  function showMatchBurst(combo) {
    var el = $('cgMatchBurst');
    if (!el) return;
    if (effectTimer !== null) clearTimeout(effectTimer);
    el.textContent = '';
    var label = document.createElement('strong');
    label.textContent = combo >= 2 ? combo + 'ペア連続！' : 'ペア成立！';
    el.appendChild(label);
    for (var i = 0; i < 7; i++) {
      var star = document.createElement('span'); star.textContent = i % 2 ? '✦' : '✧';
      star.style.setProperty('--piece', i); el.appendChild(star);
    }
    el.hidden = false;
    effectTimer = setTimeout(function () { el.hidden = true; effectTimer = null; }, 900);
  }
  function refreshScore() {
    if (!run) return;
    $('cgPlayerScore').textContent = String(run.playerPairs);
    $('cgCpuScore').textContent = String(run.cpuPairs);
    $('cgCounter').textContent = run.results.length + ' / ' + run.items.length + ' ペア';
    $('cgProgress').style.width = Math.round(run.results.length / run.items.length * 100) + '%';
    $('cgPlayerPanel').classList.toggle('is-playing', run.turn === 'player');
    $('cgCpuPanel').classList.toggle('is-playing', run.turn === 'cpu');
    $('cgTurn').textContent = run.turn === 'player' ? '🙂 あなたの番です。カードを2枚選んでください。'
      : '🤖 CPUの番です。カードを覚えながら見てみましょう。';
    $('cgTurn').className = 'cg-turn ' + (run.turn === 'player' ? 'is-player' : 'is-cpu');
  }
  function start() {
    cleanup();
    var count = E.countSetting($('cgCount').value), level = E.levelSetting($('cgLevel').value);
    if (root.KotobaLevels) {
      root.KotobaLevels.select('cardMemory', level);
      level = root.KotobaLevels.get('cardMemory').selected;
    }
    run = {activityId:'cardMemory',level:level,items:E.selectItems(count,level),
      results:[],startedAt:new Date(),completed:false,locked:false,turn:'player',turns:0,
      playerPairs:0,cpuPairs:0,attempts:{player:0,cpu:0},mismatches:{player:0,cpu:0},
      playerCombo:0,bestCombo:0,
      misses:Object.create(null),memoryOffset:0,memoryDone:0,
      paired:Object.create(null),cpuKnown:Object.create(null),flipped:[],cardDeck:[],cardButtons:[]};
    if (root.KotobaUnifiedLearning) try { root.KotobaUnifiedLearning.begin('genres','神経衰弱','cardMemory'); } catch (_) {}
    $('cgFeedback').hidden = true;
    updateCombo();
    showOnly('cgPlay');
    renderMemoryBoard();
    startTurn('player', false);
    playCue('start');
  }
  function renderMemoryBoard() {
    if (!run) return;
    var batch = run.items.slice(run.memoryOffset, run.memoryOffset + 5);
    if (!batch.length) { finish(); return; }
    run.cardDeck = E.memoryCards(batch);
    run.cardButtons = []; run.flipped = []; run.memoryDone = 0;
    run.paired = Object.create(null); run.cpuKnown = Object.create(null);
    run.locked = true;
    $('cgCards').className = 'cg-cards cg-memory-grid'; $('cgCards').textContent = '';
    $('cgFeedback').hidden = true;
    $('cgQuestion').textContent = '同じ絵を2枚ずつ探しましょう（' +
      (run.memoryOffset + 1) + '〜' + (run.memoryOffset + batch.length) + 'ペア目）';
    run.cardDeck.forEach(function (card, index) {
      var button = buttonCard(card.item, index);
      button.addEventListener('click', function () { playerFlip(card, index, button); });
      run.cardButtons[index] = button; $('cgCards').appendChild(button);
    });
    refreshScore();
  }
  function startTurn(owner, sound) {
    if (!run || run.completed) return;
    run.turn = owner; run.turns++; run.flipped = [];
    run.locked = owner !== 'player'; refreshScore();
    if (sound !== false) playCue(owner === 'player' ? 'turnPlayer' : 'turnCpu');
    if (owner === 'cpu') later(cpuMove, 680);
  }
  function availableIndices() {
    return run.cardDeck.map(function (card, index) { return run.paired[card.item.id] ? -1 : index; })
      .filter(function (index) { return index >= 0; });
  }
  function pickRandom(indices) { return indices[Math.floor(Math.random() * indices.length)]; }
  function reveal(card, index, button) {
    button.classList.remove('is-hidden'); button.classList.add('is-flipped');
    if (run.turn === 'cpu') button.classList.add('is-cpu-turn');
    button.setAttribute('aria-label', card.item.name);
    run.cpuKnown[index] = card.item.id; // CPUに見えたカードのみ記憶
    run.flipped.push({card:card,index:index,button:button});
    playCue('cardFlip');
  }
  function hideCard(entry) {
    entry.button.classList.add('is-hidden'); entry.button.classList.remove('is-flipped');
    entry.button.classList.remove('is-cpu-turn');
    entry.button.setAttribute('aria-label', '裏向きカード ' + (entry.index + 1));
  }
  function playerFlip(card, index, button) {
    if (!run || run.completed || run.turn !== 'player' || run.locked ||
        run.paired[card.item.id] || run.flipped.some(function (entry) { return entry.index === index; })) return;
    reveal(card, index, button);
    if (run.flipped.length === 2) settlePair('player');
  }
  function cpuFirst() {
    var available = availableIndices(), knownPairs = Object.create(null);
    available.forEach(function (index) {
      var knownId = run.cpuKnown[index];
      if (knownId) (knownPairs[knownId] || (knownPairs[knownId] = [])).push(index);
    });
    var pairs = Object.keys(knownPairs).filter(function (id) { return knownPairs[id].length >= 2; });
    if (pairs.length && Math.random() < memoryStrength[run.level - 1])
      return pickRandom(knownPairs[pickRandom(pairs)]);
    // 初めての絵も探す。まだ開かれていないカードの中身は参照しない。
    var unseen = available.filter(function (index) { return run.cpuKnown[index] === undefined; });
    return pickRandom(unseen.length ? unseen : available);
  }
  function cpuSecond(firstIndex) {
    var itemId = run.cardDeck[firstIndex].item.id;
    var available = availableIndices().filter(function (index) { return index !== firstIndex; });
    var remembered = available.filter(function (index) { return run.cpuKnown[index] === itemId; });
    if (remembered.length && Math.random() < memoryStrength[run.level - 1]) return pickRandom(remembered);
    var unknown = available.filter(function (index) { return run.cpuKnown[index] === undefined; });
    return pickRandom(unknown.length ? unknown : available);
  }
  function cpuMove() {
    if (!run || run.completed || run.turn !== 'cpu' || run.flipped.length) return;
    var first = cpuFirst();
    if (first === undefined) { finish(); return; }
    reveal(run.cardDeck[first], first, run.cardButtons[first]);
    later(function () {
      var second = cpuSecond(first);
      if (second === undefined) { finish(); return; }
      reveal(run.cardDeck[second], second, run.cardButtons[second]);
      settlePair('cpu');
    }, 760);
  }
  function recordPair(item, owner) {
    var mistakes = run.misses[item.id] || 0, player = owner === 'player';
    var review = player ? E.memoryReview(item, mistakes) :
      '今回はCPUが「' + item.name + '」のペアを取りました。「' + item.emoji + '」は' +
      item.explanation + ' 次は絵とカードの位置を意識してみましょう。' +
      (mistakes ? ' この絵では自分の不一致が' + mistakes + '回ありました。' : '');
    var entry = {number:run.items.indexOf(item) + 1,
      question:'「' + item.name + '」の絵を2枚そろえる',
      answer:item.name + ' ' + item.emoji, given:owner === 'player' ? 'プレイヤー獲得' : 'CPU獲得',
      correct:player,status:player ? 'プレイヤー獲得' : 'CPU獲得',
      explanation:'「' + item.name + '」は' + item.explanation,
      improvement:review,answerMode:'memory-pair',obtainedBy:owner,playerMisses:mistakes};
    run.results.push(entry);
    // CPUが先に取ったペアは、利用者自身の誤答として学習AIに記録しない。
    if (player && root.KotobaUnifiedLearning) try {
      root.KotobaUnifiedLearning.recordAnswer('genres',
        {id:item.id,answer:item.name,difficultyLevel:run.level,prompt:entry.question},player);
    } catch (_) {}
  }
  function settlePair(owner) {
    if (!run || run.flipped.length !== 2) return;
    run.locked = true; run.attempts[owner]++;
    var pair = run.flipped.slice(), a = pair[0], b = pair[1];
    if (a.card.item.id === b.card.item.id) {
      run.paired[a.card.item.id] = true; run.memoryDone++;
      a.button.classList.add('is-matched'); b.button.classList.add('is-matched');
      a.button.disabled = true; b.button.disabled = true;
      if (owner === 'player') {
        run.playerPairs++;
        run.playerCombo++;
        run.bestCombo = Math.max(run.bestCombo, run.playerCombo);
        showMatchBurst(run.playerCombo);
        updateCombo();
      } else run.cpuPairs++;
      recordPair(a.card.item, owner);
      feedback(owner === 'player' ? '⭕ あなたが1ペア獲得！' : '🤖 CPUが1ペア獲得',
        '「' + a.card.item.name + '」は' + a.card.item.explanation + ' そろったので、同じ人が続けます。',true);
      playCue(owner === 'player' && run.playerCombo >= 2 ? 'cardCombo' : 'cardMatch');
      run.flipped = []; refreshScore();
      later(function () {
        if (run.memoryDone >= Math.min(5, run.items.length - run.memoryOffset)) {
          run.memoryOffset += Math.min(5, run.items.length - run.memoryOffset);
          if (run.memoryOffset >= run.items.length) { finish(); return; }
          renderMemoryBoard();
        }
        startTurn(owner);
      }, 1150);
    } else {
      run.mismatches[owner]++;
      if (owner === 'player') {
        run.playerCombo = 0; updateCombo();
        run.misses[a.card.item.id] = (run.misses[a.card.item.id] || 0) + 1;
        run.misses[b.card.item.id] = (run.misses[b.card.item.id] || 0) + 1;
      }
      feedback(owner === 'player' ? '🔍 違う絵です。CPUの番へ' : '🤖 CPUも間違えました！あなたの番へ',
        '「' + a.card.item.name + '」と「' + b.card.item.name + '」でした。位置を覚えて次の番に備えましょう。',false);
      playCue('cardMismatch');
      later(function () {
        hideCard(a); hideCard(b); run.flipped = [];
        startTurn(owner === 'player' ? 'cpu' : 'player');
      }, 1150);
    }
  }
  function awardMedal(player,total) {
    // 既存のメダル規則を維持：全ペアを自力で取ったら5枚、1組以上なら1枚。
    var reward = player === total ? 5 : (player > 0 ? 1 : 0);
    if (!reward) return 0;
    try {
      var key = 'kotobaDungeonSaveV1', save = JSON.parse(secureStorageGet(key) || '{}') || {};
      save.medals = Math.max(0, Math.floor(Number(save.medals) || 0)) + reward;
      if (!Array.isArray(save.unlockedAvatarIds)) save.unlockedAvatarIds = [1,2,3,4];
      if (!Array.isArray(save.unlockedOutfitIds)) save.unlockedOutfitIds = [];
      localStorage.setItem(key, JSON.stringify(save)); return reward;
    } catch (_) { return 0; }
  }
  function saveRecord(mastery, analysis, outcome) {
    var end = new Date(), start = run.startedAt;
    var profile = root.KotobaQuestUserProfile && root.KotobaQuestUserProfile.getCurrent ?
      root.KotobaQuestUserProfile.getCurrent() : {};
    var total = run.items.length, score = run.playerPairs;
    var record = {id:String(end.getTime()) + '-memory-cpu-' + Math.random().toString(36).slice(2,8),
      date:end.getFullYear() + '-' + String(end.getMonth()+1).padStart(2,'0') + '-' + String(end.getDate()).padStart(2,'0'),
      time:end.toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}),
      startedAt:start.toISOString(),finishedAt:end.toISOString(),
      durationSec:Math.max(0,Math.round((end-start)/1000)),
      category:'神経衰弱',genre:'神経衰弱',activity:'神経衰弱｜CPU対戦',
      score:score,total:total,rate:Math.round(score/total*100),activityId:run.activityId,
      difficultyLevel:run.level,masteryBefore:mastery?mastery.before:0,
      masteryAfter:mastery?mastery.points:0,kind:'cardGame',gameMode:'cpu-versus',
      outcome:outcome,playerPairs:run.playerPairs,cpuPairs:run.cpuPairs,
      bestCombo:run.bestCombo,
      playerAttempts:run.attempts.player,cpuAttempts:run.attempts.cpu,
      playerMistakes:run.mismatches.player,cpuMistakes:run.mismatches.cpu,
      turns:run.turns,userProfileId:profile.profileId||'unconfigured',
      userName:profile.displayName||'名前未登録',userCode:profile.recordCode||'',
      questionResults:run.results.slice().sort(function (a,b) { return a.number-b.number; }).slice(0,100)};
    if (analysis) record.adaptive = analysis;
    try {
      var key = 'aphasiaTrainingRecordsV4', records = JSON.parse(secureStorageGet(key) || '[]');
      if (!Array.isArray(records)) records = [];
      records.push(record);
      records.sort(function (a,b) { return new Date(a.finishedAt)-new Date(b.finishedAt); });
      localStorage.setItem(key,JSON.stringify(records)); return true;
    } catch (_) { return false; }
  }
  function finish() {
    if (!run || run.completed) return;
    run.completed = true; cleanup();
    var total = run.items.length, score = run.playerPairs;
    var outcome = score > run.cpuPairs ? '勝利' : score < run.cpuPairs ? '敗北' : '引き分け';
    var rate = Math.round(score / total * 100), mastery = null, analysis = null;
    if (root.KotobaLevels) mastery = root.KotobaLevels.finish(run.activityId, rate, true, total);
    if (root.KotobaUnifiedLearning) try {
      analysis = root.KotobaUnifiedLearning.finish('genres',
        {genre:'神経衰弱',activity:run.activityId,score:score,total:total});
    } catch (_) {}
    var saved = saveRecord(mastery,analysis,outcome), medals = awardMedal(score,total);
    $('cgResultIcon').textContent = outcome === '勝利' ? '🏆' : outcome === '敗北' ? '🌱' : '🤝';
    $('cgResultTitle').textContent = '神経衰弱｜CPU対戦　' + outcome;
    $('cgResultScore').textContent = 'あなた ' + score + ' ペア ／ CPU ' + run.cpuPairs + ' ペア';
    $('cgResultRate').textContent = '獲得率 ' + rate + '%　｜　最大連続成功 ' + run.bestCombo + 'ペア';
    $('cgResultMessage').textContent = (outcome === '勝利' ? 'おめでとうございます！' : outcome === '敗北' ? '今回の経験を次の挑戦につなげましょう。' : '接戦でした！') +
      ' あなたの不一致 ' + run.mismatches.player + '回・CPUの不一致 ' + run.mismatches.cpu + '回。' +
      (saved ? '結果を記録しました。' : '結果を保存できませんでした。');
    $('cgReward').textContent = '🏅 メダル +' + medals + '枚';
    $('cgMasteryPanel').hidden = !mastery;
    if (mastery) {
      $('cgMasteryTitle').textContent = 'Lv.' + mastery.level + ' 熟練度';
      $('cgMasteryValue').textContent = mastery.points + ' / 100';
      $('cgMasteryBar').style.width = Math.max(0,Math.min(100,mastery.points)) + '%';
      $('cgMastery').textContent = mastery.raised ? '次のレベルを解放しました！' : '少しずつ経験を積み重ねましょう。';
    }
    var wrap = $('cgResultItems'); wrap.textContent = '';
    run.results.slice().sort(function (a,b) { return a.number-b.number; }).forEach(function (item) {
      var box = document.createElement('div');
      box.className = 'cg-result-item ' + (item.correct ? 'is-correct' : 'is-cpu');
      var title = document.createElement('strong');
      title.textContent = item.number + 'ペア目 ' + item.status + '｜' + item.question;
      var why = document.createElement('p'); why.textContent = '答え：' + item.answer + '／解説：' + item.explanation;
      var review = document.createElement('p'); review.textContent = '復習：' + item.improvement;
      box.append(title,why,review); wrap.appendChild(box);
    });
    showOnly('cgResult');
    playCue(outcome === '勝利' ? 'win' : outcome === '敗北' ? 'lose' : 'draw');
    if (root.KotobaDailyStreak) try { root.KotobaDailyStreak.finish('cgDailyStreak'); } catch (_) {}
  }
  function reset() { cleanup(); run = null; populateLevels(); showOnly('cgSetup'); }
  $('cgLevel').addEventListener('change', function () {
    if (root.KotobaLevels) root.KotobaLevels.select('cardMemory',Number(this.value));
  });
  $('cgStart').addEventListener('click',start);
  $('cgQuit').addEventListener('click',reset);
  $('cgReplay').addEventListener('click',reset);
  readUrlSetup(); populateLevels();
})(window);
