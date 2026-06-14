/* Endodirect Service Worker — estratégia network-first conservadora.
   Objetivo: habilitar instalação como PWA e funcionar offline básico SEM
   nunca servir HTML/app desatualizado (a plataforma muda com frequência e o
   index.html é sempre revalidado na borda). Por isso:
   - Navegações (HTML): NETWORK-FIRST (online sempre pega o app fresco; offline
     cai no último index.html cacheado).
   - /api/*: NUNCA cacheado (sempre rede).
   - Cross-origin (Supabase, jsDelivr, Vimeo, etc.): passa direto, sem interceptar.
   - Estáticos do próprio domínio: stale-while-revalidate. */
var CACHE = 'endodirect-v2';
var ASSETS = [
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;      // cross-origin: não intercepta
  if (url.pathname.indexOf('/api/') === 0) return;       // API: sempre rede

  if (req.mode === 'navigate') {
    // HTML: rede primeiro; offline cai no index cacheado.
    e.respondWith(
      fetch(req).then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put('/index.html', copy); });
        return r;
      }).catch(function () {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Estáticos: stale-while-revalidate.
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (r) {
        if (r && r.status === 200) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return r;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
