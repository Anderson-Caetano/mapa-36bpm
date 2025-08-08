const CACHE_NAME = 'mapa-36bpm-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/logo-36.png',
  './data/subsetores-36bpm.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.js',
  'https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))).then(self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then(cached => 
      cached || fetch(request).then(resp => {
        // Cache fetched files opportunistically
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, respClone));
        return resp;
      }).catch(() => cached)
    )
  );
});