// 【日本語注記】サービスワーカーはルート直下に置いてください。
// 移動するとキャッシュ適用範囲が変わるため、scripts/へは移していません。
// 画像・JS・CSSのパスを変更した場合は APP_SHELL の参照先も合わせてください。
// Previous offline cache: kotoba-quest-ver1.2.0-pc-r2
const CACHE_NAME = 'kotoba-quest-ver1.2.1-pc-scripts-organized';
// Cache the small application shell during installation. Large photos, sound
// and optional recognition resources are cached only when actually requested.
// Runtime shell only. Optional 3D pages, images, media and training modes
// are fetched and cached when requested, rather than all during installation.
const APP_SHELL = [
  "./",
  "./index.html",
  "./START_HERE.html",
  "./credits.html",
  "./logo.html",
  "./opening-event.html",
  "./manifest.webmanifest?v=121-image-org",
  "./images/app-icons/icon-192.png",
  "./styles/base/style.css?v=veta24-activity-icons",
  "./styles/ui/difficulty-veta11.css?v=1",
  "./styles/base/browser-responsive.css?v=89",
  "./styles/training/v47-improvements.css?v=jlect-choice-1",
  "./styles/training/pronunciation-training.css?v=89",
  "./styles/ai/ai-download-gate.css?v=99",
  "./styles/ui/daily-streak.css?v=108",
  "./styles/ai/ai-quiz-v23.css?v=23",
  "./styles/base/title-responsive-beta3.css?v=3",
  "./styles/training/articulation-random-beta4.css?v=4",
  "./styles/base/responsive-beta6.css?v=6",
  "./styles/ui/veta14-ui.css?v=2",
  "./styles/ui/veta17-theme.css?v=2",
  "./styles/ui/veta19-dialogue.css?v=1",
  "./styles/training/training-revision-ver120.css?v=r2",
  "./styles/training/training-distinction-r5.css?v=r5",
  "./scripts/system/encoding-safe.js",
  "./scripts/system/android-bridge-android.js?v=beta91-audio",
  "./scripts/audio/audio-mixer-v86.js?v=91",
  "./scripts/audio/kotoba-audio-common-r5.js?v=r5",
  "./scripts/audio/kotoba-sound-pack-v2.js?v=22",
  "./scripts/audio/kotoba-sound-design-v19.js?v=23",
  "./scripts/learning/learning-mode-veta12.js?v=veta17-on",
  "./scripts/learning/adaptive-learning.js?v=veta12",
  "./scripts/system/daily-streak.js?v=108",
  "./scripts/audio/event-message-sound.js?v=22",
  "./scripts/conversation/offline-conversation-engine.js?v=91",
  "./scripts/conversation/ai-answer-v23.js?v=23",
  "./scripts/application/app.js?v=ver120r2",
  "./scripts/system/user-profile.js?v=veta17-id",
  "./scripts/learning/unified-learning-veta1.js?v=veta12",
  "./scripts/training/aphasia-modes.js?v=ver120r2",
  "./scripts/conversation/generative-ai-chat.js?v=ver120r2",
  "./scripts/conversation/ai-download-gate.js?v=99",
  "./scripts/system/app-ui.js?v=veta17-save-theme",
  "./scripts/system/community-board.js",
  "./scripts/training/reading-memory-mode.js?v=104",
  "./scripts/questions/copy-handwriting-bank-v2.js?v=jlect-choice-1",
  "./scripts/training/v47-improvements.js?v=ver120r2",
  "./scripts/training/v57-task-rebuild.js?v=ver120r2",
  "./scripts/questions/question-expansion-v10.js?v=veta10-20questions",
  "./scripts/questions/question-bank-veta11.js?v=veta30-kanji-aliases",
  "./scripts/training/training-distinction-r5.js?v=r5",
  "./scripts/training/pronunciation-training.js?v=ver120r2",
  "./scripts/system/kotoba-upgrades-v2.js?v=2",
  "./scripts/learning/difficulty-veta11.js?v=veta14-level-lock",
  "./scripts/questions/question-explanations-veta18.js?v=19",
  "./scripts/training/copy-tracing-ver120.js?v=r2",
  "./fontawesome/webfonts/fa-solid-900.woff2",
  "./fontawesome/webfonts/fa-regular-400.woff2",
  "./fontawesome/webfonts/fa-brands-400.woff2",
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Warm the same offline assets, but in small batches. Parallel requests
    // for every question image at once can overwhelm slower devices.
    for (let i = 0; i < APP_SHELL.length; i += 6) {
      await Promise.all(APP_SHELL.slice(i, i + 6).map(async path => {
        try {
          const request = new Request(new URL(path, self.registration.scope).href, { cache: 'reload' });
          const response = await fetch(request);
          if (response.ok) await cache.put(request, response.clone());
        } catch (_) { /* Requested files cache as they are used. */ }
      }));
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('kotoba-quest-') && k !== CACHE_NAME).map(k => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok && response.type !== 'opaque') {
          try { await cache.put(request, response.clone()); } catch (_) {}
        }
        return response;
      } catch (error) {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const shell = await cache.match(new URL('index.html', self.registration.scope).href, { ignoreSearch: true });
          if (shell) return shell;
        }
        throw error;
      }
    })());
  }
});
