/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/3d/pc-3d-guide.js
 * 役割：PCで3Dが表示されない場合の案内
 * 利用画面：pictogram-3d.html,cat-word-puzzle.html,cat-word-race.html,PC_3D_CHECK.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* VETA31 PC R8: file:// は正式対応。WebGL 2 非対応時のみ案内します。 */
(() => {
  let supportsWebGL2 = false;
  try { supportsWebGL2 = !!document.createElement('canvas').getContext('webgl2'); } catch (_) {}
  if (supportsWebGL2) return;
  function show() {
    const panel = document.createElement('aside');
    panel.setAttribute('role', 'alert');
    Object.assign(panel.style, {
      position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
      width: 'min(520px,calc(100vw - 24px))', maxHeight: '45vh', overflowY: 'auto',
      zIndex: '2147483640', padding: '14px 18px', border: '3px solid #f0bd57',
      borderRadius: '14px', background: '#fffbed', color: '#4b381f',
      boxShadow: '0 10px 35px #0005', font: '700 14px/1.7 system-ui,sans-serif'
    });
    const message = document.createElement('p');
    message.style.margin = '0 0 10px';
    message.textContent = '⚠️ WebGL 2を利用できません。PC版はHTML直接起動に対応していますが、3D描画にはWebGL 2が必要です。Chrome/Edgeのグラフィックアクセラレーションを有効にし、必要に応じてGPUドライバーを更新してください。スタートページの「3Dの動作を確認する」で検査できます。';
    const dismiss = document.createElement('button');
    dismiss.type = 'button'; dismiss.textContent = '確認しました';
    Object.assign(dismiss.style, {padding:'8px 16px',border:0,borderRadius:'8px',background:'#2f8253',color:'#fff',cursor:'pointer',font:'inherit'});
    dismiss.addEventListener('click', () => panel.remove());
    panel.append(message, dismiss);
    document.body.appendChild(panel);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, {once:true});
  else show();
})();
