/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

precacheAndRoute(self.__WB_MANIFEST);

// Auto-update: skip the "waiting" phase so a new build activates as soon as it installs, instead
// of stalling until every client closes (the "PWA needs several restarts to update" problem). The
// browser re-fetches sw.js itself, so this works regardless of the old build's update handler — an
// old client lands on the new build on its next reopen/reload. Needed for the entity-hierarchy
// upgrade, where an old client against the reshaped server can't sync.
//
// No clients.claim() and no forced reload: a running session keeps its in-memory bundle until the
// user reopens, so data entry isn't interrupted. (No route-level code-splitting today; if that is
// added, retain old hashed assets on deploy so an open session's lazy chunk load can't 404.)
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
