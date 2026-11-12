/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/training/copy-tracing-ver120.js
 * 役割：写字・見写しのなぞり練習
 * 利用画面：index.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* PCブラウザ用「写字・見写し」なぞり練習。画像認識や文字の自動採点は行わない。 */
(function () {
  'use strict';
  var original = window.renderQuestion;
  function byId(id) { return document.getElementById(id); }
  function element(tag, cls, value) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function traceQuestion(q) {
    if (!q) return;
    window.answered = false;
    var word = String(q.answer || q.prompt || '').trim().slice(0, 4);
    var title = byId('trainingTitle');
    if (title) title.textContent = '認知・理解トレーニング｜写字・見写し';
    var category = byId('categoryLabel');
    if (category) category.textContent = '認知・理解トレーニング';
    var question = byId('questionLabel');
    if (question) question.textContent = '薄い文字を指やマウスでなぞりましょう。';
    var progress = byId('progress');
    if (progress) progress.textContent = (window.current + 1) + ' / ' + window.questions.length;
    var score = byId('score');
    if (score) score.textContent = '完了 ' + window.score + '問';
    ['visualArea', 'promptText', 'instruction'].forEach(function (id) {
      var item = byId(id); if (item) item.classList.add('hidden');
    });
    var hint = byId('hint');
    if (hint) { hint.textContent = '文字の形に沿って、ゆっくりなぞってみましょう。'; hint.classList.add('hidden'); }
    var hintButton = byId('hintBtn');
    if (hintButton) hintButton.classList.toggle('hidden', !window.hintEnabled);
    var speakButton = byId('speakBtn');
    if (speakButton) speakButton.textContent = '🔊 問題を聞く';
    var feedback = byId('feedback');
    if (feedback) { feedback.textContent = ''; feedback.className = 'feedback'; }
    var next = byId('nextBtn');
    if (next) next.classList.add('hidden');
    var area = byId('answerArea');
    if (!area) return;
    area.className = 'answer-area tracing-answer-area';
    area.innerHTML = '';
    var panel = element('section', 'tracing-panel');
    panel.appendChild(element('p', 'tracing-guide', '下のお手本をなぞります。1文字ずつ練習してください。'));
    panel.appendChild(element('div', 'tracing-word', word));
    var grid = element('div', 'tracing-grid');
    var progressText = element('p', 'tracing-status', '薄い文字の上をなぞってください。');
    progressText.setAttribute('aria-live', 'polite');
    var tracks = [];
    Array.from(word).forEach(function (char, index) {
      var cell = element('div', 'tracing-cell');
      cell.appendChild(element('div', 'tracing-cell-label', (index + 1) + '文字目'));
      var canvas = document.createElement('canvas');
      canvas.width = 180; canvas.height = 180;
      canvas.className = 'tracing-canvas';
      canvas.setAttribute('aria-label', char + 'をなぞる練習欄');
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      function drawGuide() {
        ctx.clearRect(0, 0, 180, 180);
        ctx.fillStyle = '#d6e7d9';
        ctx.font = 'bold 138px "Noto Sans CJK JP", "Yu Gothic", sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(char, 90, 94, 167);
      }
      drawGuide();
      var active = false, distance = 0, last = null;
      function point(event) {
        var rect = canvas.getBoundingClientRect();
        return { x: (event.clientX - rect.left) * 180 / rect.width, y: (event.clientY - rect.top) * 180 / rect.height };
      }
      canvas.addEventListener('pointerdown', function (event) {
        if (window.answered) return;
        active = true; last = point(event);
        canvas.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      canvas.addEventListener('pointermove', function (event) {
        if (!active || window.answered) return;
        var now = point(event);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 8;
        ctx.strokeStyle = '#207c57';
        ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(now.x,now.y);ctx.stroke();
        distance += Math.hypot(now.x - last.x, now.y - last.y);
        last = now;
        event.preventDefault();
      });
      function end() { active = false; last = null; }
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointercancel', end);
      tracks.push({ reset: function () { distance = 0; end(); drawGuide(); }, done: function () { return distance >= 65; } });
      cell.appendChild(canvas); grid.appendChild(cell);
    });
    panel.appendChild(grid);
    var buttons = element('div', 'tracing-actions');
    var clear = element('button', 'tracing-reset', 'もう一度なぞる');
    clear.type = 'button';
    clear.addEventListener('click', function () {
      if (window.answered) return;
      tracks.forEach(function (t) { t.reset(); });
      progressText.textContent = 'お手本をもう一度なぞってみましょう。';
    });
    var complete = element('button', 'tracing-finish', '✍️ なぞり練習を確認する');
    complete.type = 'button';
    complete.addEventListener('click', function () {
      if (window.answered) return;
      if (!tracks.length || tracks.some(function (t) { return !t.done(); })) {
        progressText.textContent = 'まだなぞっていない文字があります。すべての文字をなぞってください。';
        return;
      }
      window.answered = true;
      window.score += 1;
      var scoreLabel = byId('score');
      if (scoreLabel) scoreLabel.textContent = '完了 ' + window.score + '問';
      if (typeof window.recordQuestionOutcome === 'function')
        window.recordQuestionOutcome(q, true, word, {answerMode:'tracing', tracingCompleted:true});
      var stats = window.kotobaCopyRunStats;
      if (!stats || !Array.isArray(stats.results)) stats = { attempted: 0, matched: 0, firstTryCorrect: 0, afterRetryCorrect: 0, incorrect: 0, results: [] };
      stats.attempted++; stats.matched++; stats.firstTryCorrect++;
      stats.results[window.current] = {result:'matched',predicted:word,firstTryCorrect:true, candidateSelected:false, answerMode:'tracing'};
      window.kotobaCopyRunStats = stats;
      if (feedback) { feedback.textContent = '⭕ なぞり練習が完了しました。文字の形の正確さは自動採点していません。'; feedback.className = 'feedback ok'; }
      progressText.textContent = '練習完了。次の問題へ進めます。';
      complete.disabled = true; clear.disabled = true;
      if (next) next.classList.remove('hidden');
      if (typeof window.playCorrectSound === 'function') window.playCorrectSound();
    });
    buttons.appendChild(clear);buttons.appendChild(complete);
    panel.appendChild(progressText);panel.appendChild(buttons);
    panel.appendChild(element('p', 'tracing-footnote', 'この練習では、文字の認識や正誤判定ではなく、なぞったことを記録します。'));
    area.appendChild(panel);
  }
  window.renderQuestion = function () {
    if (window.selectedActivity === 'copy') return traceQuestion(window.questions && window.questions[window.current]);
    return typeof original === 'function' ? original.apply(this, arguments) : undefined;
  };
})();
