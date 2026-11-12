/*
 * 【ことばクエスト ver1.2.1 PC｜日本語注記】
 * ファイル：scripts/system/user-profile.js
 * 役割：利用者プロフィールと保存先IDの共通処理
 * 利用画面：reading-memory.html,kotoba-dungeon.html,index.html,pictogram-3d.html,cat-word-puzzle.html,cat-word-race.html,kotoba-card-game.html,kotoba-quest-ud.html
 * 注意：※ HTMLの<script>読み込み順、保存キー、既存ジャンルIDを変える際は連動テストが必要です。
 * 変更時：読み込むHTML・service-worker.js・docs/スクリプト読込順.mdも確認してください。
 */
/* ==========================================================
 * ことばクエスト V62 ユーザー設定
 * 記録用の表示名と自動発行の管理番号を端末内に保存します。
 * ========================================================== */
(function () {
  'use strict';
  var STORAGE_KEY = 'kotobaquest_user_profile_v1';
  var returnTo = 'titleScreen';
  var setupMode = 'first';
  var profileReturnTo = 'titleScreen';
  function $(id) { return document.getElementById(id); }
  function loadProfile() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) { return null; }
  }
  function hasProfile() {
    var p = loadProfile();
    var name = String(p && p.displayName || '').trim();
    return !!(p && p.profileId && p.profileId !== 'unconfigured' && name && name !== '未設定' && name !== '名前未登録');
  }
  function createId() {
    var date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    var suffix = '';
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        var nums = new Uint32Array(2);
        window.crypto.getRandomValues(nums);
        suffix = nums[0].toString(36).slice(0, 4) + nums[1].toString(36).slice(0, 4);
      }
    } catch (_) {}
    return 'KQ-' + date + '-' + (suffix || Math.random().toString(36).slice(2, 10)).toUpperCase();
  }
  function getCurrent() {
    var p = loadProfile();
    if (!p) return { profileId: 'unconfigured', displayName: '名前未登録', recordCode: '', createdAt: '', updatedAt: '' };
    return {
      profileId: String(p.profileId || 'unconfigured'),
      displayName: hasProfile() ? String(p.displayName) : '名前未登録',
      recordCode: String(p.recordCode || ''),
      createdAt: String(p.createdAt || ''),
      updatedAt: String(p.updatedAt || '')
    };
  }
  function ensureAutomaticRecordCode() {
    var p = loadProfile();
    if (!p || !hasProfile() || String(p.recordCode || '').trim()) return;
    // 旧バージョンの利用者も、名前・過去記録を変えずに番号だけ一度補完。
    p.recordCode = p.profileId && p.profileId !== 'unconfigured' ? String(p.profileId) : createId();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (_) {}
  }
  function safeShow(id) {
    document.querySelectorAll('.screen').forEach(function (screen) { screen.classList.remove('active'); });
    var el = $(id);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
  }
  function refreshSummaries() {
    var p = getCurrent();
    var summary = hasProfile()
      ? '記録対象：' + p.displayName + (p.recordCode ? ' ／ 管理番号：' + p.recordCode : '')
      : 'ユーザー設定はまだ完了していません。初回起動時に設定してください。';
    var settings = $('settingsUserProfileSummary');
    if (settings) settings.textContent = summary + (hasProfile() ? ' ／ 記録・Excelに反映されます。' : '');
    var records = $('recordsUserSummary');
    if (records) records.textContent = summary + '。新しい記録には、この設定を保存します。';
  }
  function getLocalData(key, fallback) {
    try { var parsed = JSON.parse(localStorage.getItem(key) || 'null'); return parsed === null ? fallback : parsed; }
    catch (e) { return fallback; }
  }
  function renderProfileView() {
    var p = getCurrent();
    var name = $('profileViewDisplayName');
    var code = $('profileViewRecordCode');
    var created = $('profileViewCreatedAt');
    var count = $('profileViewTrainingCount');
    var medals = $('profileViewMedalCount');
    if (name) name.textContent = hasProfile() ? p.displayName : '名前未登録（初回設定で登録できます）';
    if (code) code.textContent = p.recordCode || p.profileId || '自動発行待ち';
    if (created) {
      var date = p.createdAt ? new Date(p.createdAt) : null;
      created.textContent = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('ja-JP') : '登録日なし';
    }
    var records = getLocalData('aphasiaTrainingRecordsV4', []);
    if (count) count.textContent = (Array.isArray(records) ? records.length : 0) + '回';
    var dungeon = getLocalData('kotobaDungeonSaveV1', {});
    var medalCount = dungeon && Number.isFinite(Number(dungeon.medals)) ? Math.max(0, Math.floor(Number(dungeon.medals))) : 0;
    if (medals) medals.textContent = medalCount + '枚';
    var learningStatus = $('profileViewLearningMode');
    if (learningStatus) learningStatus.textContent = window.KotobaLearningMode && window.KotobaLearningMode.isEnabled() ? 'ON' : 'OFF';
    var analyzed = $('profileViewLearningCount');
    if (analyzed) {
      var key = 'kotobaquest_adaptive_v86_' + String(p.profileId || 'unconfigured').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,50);
      var analysis = getLocalData(key,{});
      var skills = analysis && analysis.skills && typeof analysis.skills === 'object' ? analysis.skills : {};
      var total = Object.keys(skills).reduce(function(sum,id){return sum + Math.max(0,Number(skills[id].total)||0);},0);
      analyzed.textContent = total + '問';
    }
  }
  function openProfileView(from) {
    profileReturnTo = from === 'settings' ? 'settings' : 'titleScreen';
    renderProfileView();
    safeShow('userProfileView');
  }
  function openSetup(mode, backTo) {
    setupMode = mode === 'settings' ? 'settings' : 'first';
    returnTo = setupMode === 'settings' ? (backTo === 'userProfileView' ? 'userProfileView' : 'settings') : 'titleScreen';
    var p = getCurrent();
    var nameInput = $('setupUserDisplayName');
    if (nameInput) nameInput.value = hasProfile() && p.displayName !== '未設定' && p.displayName !== '名前未登録' ? p.displayName : '';
    var heading = $('userSetupHeading');
    var intro = $('userSetupIntro');
    var saveBtn = $('saveUserProfileBtn');
    var guestBtn = $('guestUserProfileBtn');
    var cancelBtn = $('cancelUserProfileBtn');
    var status = $('userProfileStatus');
    if (heading) heading.textContent = setupMode === 'settings' ? '名前の変更' : 'はじめてのユーザー設定';
    if (intro) intro.textContent = setupMode === 'settings'
      ? '記録に使用する名前を変更できます。管理番号は変更されません。'
      : '記録用の名前を設定してください。管理番号は自動発行されます。';
    if (saveBtn) saveBtn.textContent = setupMode === 'settings' ? (returnTo === 'userProfileView' ? '保存してプロフィールへ戻る' : '保存して設定へ戻る') : '設定を保存して始める';
    if (guestBtn) guestBtn.hidden = setupMode !== 'first';
    if (cancelBtn) cancelBtn.hidden = setupMode !== 'settings';
    if (status) status.textContent = '';
    safeShow('userSetup');
    if (nameInput) window.setTimeout(function () { nameInput.focus(); }, 0);
  }
  function persist(displayName) {
    var old = loadProfile();
    var now = new Date().toISOString();
    var name = String(displayName || '').trim().slice(0, 60);
    if (!name) return { ok: false, message: '記録に表示する名前を入力してください。' };
    var id = old && old.profileId && old.profileId !== 'unconfigured' ? String(old.profileId) : createId();
    // 発行済みの番号を保持。古い版で未登録だった場合もここで一度だけ発行する。
    var code = old && String(old.recordCode || '').trim() || id;
    var p = {
      version: 1,
      profileId: id,
      displayName: name,
      recordCode: code,
      createdAt: old && old.createdAt ? old.createdAt : now,
      updatedAt: now
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      refreshSummaries();
      return { ok: true, profile: p };
    } catch (e) {
      return { ok: false, message: '保存できませんでした。ブラウザーの保存設定や空き容量を確認してください。' };
    }
  }
  function finishSetup() {
    var name = $('setupUserDisplayName');
    if (setupMode === 'settings' && !window.confirm('ユーザー設定を変更しますか？')) return;
    var result = persist(name ? name.value : '');
    var status = $('userProfileStatus');
    if (!result.ok) {
      if (status) status.textContent = result.message;
      if (name) name.focus();
      return;
    }
    safeShow(returnTo);
    refreshSummaries();
    if (returnTo === 'userProfileView') renderProfileView();
    if (setupMode === 'first') window.dispatchEvent(new Event('kotoba-profile-ready'));
  }
  function startAsGuest() {
    var result = persist('ゲストユーザー');
    var status = $('userProfileStatus');
    if (!result.ok) { if (status) status.textContent = result.message; return; }
    safeShow('titleScreen');
    refreshSummaries();
    window.dispatchEvent(new Event('kotoba-profile-ready'));
  }
  function cancelSetup() { safeShow(returnTo); refreshSummaries(); if (returnTo === 'userProfileView') renderProfileView(); }
  function init() {
    ensureAutomaticRecordCode();
    var form = $('userProfileForm');
    if (form) form.addEventListener('submit', function (event) { event.preventDefault(); finishSetup(); });
    var guest = $('guestUserProfileBtn');
    if (guest) guest.addEventListener('click', startAsGuest);
    var cancel = $('cancelUserProfileBtn');
    if (cancel) cancel.addEventListener('click', cancelSetup);
    var edit = $('editUserProfileBtn');
    if (edit) edit.addEventListener('click', function () { openSetup('settings'); });
    var titleProfile = $('titleProfileBtn');
    if (titleProfile) titleProfile.addEventListener('click', function () { openProfileView('titleScreen'); });
    var settingsProfile = $('viewUserProfileBtn');
    if (settingsProfile) settingsProfile.addEventListener('click', function () { openProfileView('settings'); });
    var profileEdit = $('profileViewEditBtn');
    if (profileEdit) profileEdit.addEventListener('click', function () { openSetup('settings', 'userProfileView'); });
    var profileBack = $('profileViewBackBtn');
    if (profileBack) profileBack.addEventListener('click', function () { safeShow(profileReturnTo); });
    refreshSummaries();
  }
  window.KotobaQuestUserProfile = {
    getCurrent: getCurrent,
    hasProfile: hasProfile,
    openSetup: openSetup,
    openProfileView: openProfileView,
    refreshSummaries: refreshSummaries,
    updateDisplayName: function (name) {
      var result=persist(String(name||'').trim());
      if(result.ok)window.dispatchEvent(new Event('kotoba-profile-updated'));
      return result;
    }
  };
  init();
})();
