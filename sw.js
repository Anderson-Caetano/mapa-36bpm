// BUMP para limpar cache antigo quando atualizar arquivos
const CACHE_NAME = 'mapa-36bpm-v3';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo-36.png',
  './subsetores-36bpm.json',
  // CDNs do Leaflet ficam fora do cache estático (serão cacheadas sob demanda)
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
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Network-first para JSON e HTML; cache-first para estáticos
  if (req.url.endsWith('.json') || req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        return res;
      }))
    );
  }
});
