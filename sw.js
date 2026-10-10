/* Grzybownik: aplikacja otwiera się bez zasięgu; pliki własne zawsze najpierw z sieci, żeby aktualizacje docierały od razu. */
const C = 'grzybownik-v4';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon.svg'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./'))));
  } else if (u.hostname === 'unpkg.com') {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(x => {
      const cp = x.clone(); caches.open(C).then(c => c.put(e.request, cp)); return x;
    })));
  }
});
