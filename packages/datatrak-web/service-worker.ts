/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

precacheAndRoute(self.__WB_MANIFEST);

// Auto-update: activate a newly deployed build and take control of open clients without waiting
// for the page to cooperate. A device on an older build that can't cleanly activate an update via
// the in-app prompt still lands on the new build on its next reopen/reload. This is essential for
// the entity-hierarchy upgrade, where an old client left running against the reshaped server can't
// sync. It does not force-reload a live session — the new build loads on the next reopen.
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
