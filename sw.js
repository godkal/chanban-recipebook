/* 찬밥식당 레시피북 서비스 워커
 * - 앱 껍데기(HTML·manifest·아이콘)를 미리 캐시해 오프라인에서도 열린다.
 * - 화면 이동은 네트워크 우선(실패 시 캐시), 나머지 자산은 Stale-While-Revalidate 로
 *   새 배포가 다음 방문에 바로 반영된다.
 */
const CACHE = 'chanban-recipebook-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  // 유튜브 썸네일 등 외부 자산은 브라우저 기본 동작에 맡긴다.
  if (url.origin !== self.location.origin) return;

  // 화면 이동: 네트워크 우선, 오프라인이면 캐시된 앱 껍데기
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put('./index.html', copy));
          }
          return res;
        })
        .catch(() =>
          caches.match('./index.html', { ignoreSearch: true })
            .then(hit => hit || caches.match('./'))
            .then(hit => hit || new Response('오프라인 상태입니다. 연결 후 다시 열어 주세요.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            }))
        )
    );
    return;
  }

  // 그 외: 캐시 먼저 보여 주고 뒤에서 갱신
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const fresh = fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});
