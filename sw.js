const CACHE_NAME = 'ccomss-player-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './music/01_track1.mp3',
  './music/02_track2.mp3',
  './music/03_track3.mp3',
  './music/04_track4.mp3',
  './music/05_track5.mp3',
  './music/06_track6.mp3',
  './music/07_track7.mp3',
  './music/08_track8.mp3',
  './music/09_track9.mp3',
  './music/10_track10.mp3'
];

// 설치 시 핵심 파일 캐시 (음악 파일 제외 - 용량이 크므로 재생 시 캐시)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./', './index.html', './manifest.json']);
    })
  );
  self.skipWaiting();
});

// 오래된 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 요청 처리: 캐시 우선, 없으면 네트워크 후 캐시 저장
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // 오프라인 fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
