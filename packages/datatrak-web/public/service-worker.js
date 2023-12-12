/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

console.log('Hello from service worker!');
const cacheName = 'datatrak-cache-v1';
const resourcesToCache = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', event => {
  console.log('Service worker installed');
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(resourcesToCache);
    }),
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }),
  );
});
