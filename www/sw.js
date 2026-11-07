/* FOCO — cache offline */
const C = 'foco-v1';
const FILES = ['./', './index.html', './styles.css', './data.js', './exanim.js', './app.js', './vulto.js', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('cdn.jsdelivr.net') || e.request.url.includes('fonts.g'))) {
      const copy = res.clone(); caches.open(C).then(c => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
