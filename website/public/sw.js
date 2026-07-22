// crd-ui service worker.
// - Pages and un-hashed assets (llms-full.txt, banner.png, dev modules…) go
//   network-first so updates are never frozen; the cache is only a fallback.
// - Only /_astro/* is cache-first: those files are content-hashed, immutable.
const CACHE = 'crd-ui-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((match) => match || (request.mode === 'navigate' ? caches.match('/') : undefined)),
    );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(
      caches.match(request).then(
        (match) =>
          match ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(networkFirst(request));
});
