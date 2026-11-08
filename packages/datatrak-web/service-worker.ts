/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

precacheAndRoute(self.__WB_MANIFEST);

// One-shot marker written during install and consumed on activate. It must survive a worker
// restart between the two events, so it lives in the Cache API rather than a module variable.
// Consuming it also stops a failed navigation from retrying into a reload loop.
const UPGRADE_CACHE = 'sw-upgrade';
const UPGRADE_KEY = '/__upgrade-pending__';

const flagUpgrade = async () => {
  // During install `registration.active` is the worker being replaced — absent on a first install,
  // where there is no old bundle to move off and a reload would be a visible flash for nothing.
  if (!self.registration.active) return;
  const cache = await caches.open(UPGRADE_CACHE);
  await cache.put(UPGRADE_KEY, new Response(''));
};

const consumeUpgradeFlag = async () => {
  const cache = await caches.open(UPGRADE_CACHE);
  if (!(await cache.match(UPGRADE_KEY))) return false;
  await cache.delete(UPGRADE_KEY);
  return true;
};

// Reloading mid-survey would drop unsaved answers. Those sessions keep the old bundle until the
// user reloads, so their next sync still hits the version gate — losing entered data is the worse
// outcome. `/survey` on its own is the picker, which carries nothing.
// They are claimed but unreloaded, so they now fetch through the new worker. Harmless without
// route-level code splitting; if that is added, retain old hashed assets on deploy so a lazy chunk
// load from one of these sessions can't 404.
const isMidSurvey = (url: string) => /^\/survey\/[^/]+\/[^/]+/.test(new URL(url).pathname);

const refreshClientsOnUpgrade = async () => {
  if (!(await consumeUpgradeFlag())) return;

  // navigate() only works on clients this worker controls, so claim before navigating.
  await self.clients.claim();

  const clients = (await self.clients.matchAll({ type: 'window' })) as readonly WindowClient[];
  await Promise.all(
    clients
      .filter(client => !isMidSurvey(client.url))
      // A client that refuses to navigate (bfcache, unload handler) still reaches the new build on
      // its next reopen, so a failure here is no worse than the old behaviour.
      .map(client => client.navigate(client.url).catch(() => undefined)),
  );
};

// Auto-update: skip the "waiting" phase so a new build activates as soon as it installs, instead
// of stalling until every client closes (the "PWA needs several restarts to update" problem). The
// browser re-fetches sw.js itself, so this works regardless of the old build's update handler — an
// old client lands on the new build on its next reopen/reload. Needed for the entity-hierarchy
// upgrade, where an old client against the reshaped server can't sync.
self.addEventListener('install', event => {
  event.waitUntil(flagUpgrade());
  self.skipWaiting();
});

// Activating isn't enough on its own: without claim+navigate the already-open page keeps serving
// its old in-memory bundle, and skipWaiting means that bundle's update banner never fires (every
// path it has keys off `registration.waiting`, which no longer happens). Combined with the sync
// version gate that leaves the user stuck with blocked sync and no way forward but to close and
// reopen the app. Reloading them here is the same end state, reached automatically.
self.addEventListener('activate', event => {
  event.waitUntil(refreshClientsOnUpgrade());
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
