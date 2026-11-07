const CACHE_NAME = 'hirafish-aquarium-v3';
const ASSETS = [
  './',
  './index.html',
  './nazo-practice/',
  './nazo-practice/index.html',
  './nazo-practice/a1z26/',
  './nazo-practice/a1z26/index.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
     .then(() => self.clients.matchAll({ type: 'window' }))
     .then((clients) => {
       clients.forEach((client) => {
         if ('navigate' in client) {
           client.navigate(client.url);
         }
       });
     })
  );
});

// Network-First strategy: Always fetch latest when online, fallback to cache when offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
