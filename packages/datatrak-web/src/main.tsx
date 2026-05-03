import React from 'react';
import log from 'winston';
import { render as renderReactApp } from 'react-dom';
import { Workbox } from 'workbox-window';

import { App } from './App';
import { setUpdateReady } from './components/UpdateConfirmation';
import { useIsOfflineFirst } from './api/offlineFirst';

renderReactApp(<App />, document.getElementById('root'));

/**
 * Only treat this as an app update when a worker is *waiting* behind an *active*
 * controller. Otherwise we can flash a false "new version" banner (e.g. first
 * install or transient install states). workbox-window's `waiting` event applies
 * the same idea, including a short delay to avoid skipWaiting-in-install races.
 */
const promptUserToUpdate = (registration: ServiceWorkerRegistration) => {
  if (!registration.waiting || !registration.active) {
    return;
  }
  setUpdateReady(registration);
};

let workboxInstance: Workbox | null = null;

if (useIsOfflineFirst()) {
  window.addEventListener('load', async () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const wb = new Workbox('/sw.js', { updateViaCache: 'none' });
    workboxInstance = wb;

    wb.addEventListener('waiting', () => {
      void navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          promptUserToUpdate(registration);
        }
      });
    });

    const registration = await wb.register();
    if (!registration) {
      return;
    }

    log.info('Checking for updates...');
    await wb.update();

    if (registration.waiting && registration.active) {
      promptUserToUpdate(registration);
    }
  });

  // Add periodic update checks for PWAs (every 1 minute)
  const UPDATE_CHECK_INTERVAL = 60 * 1000;

  setInterval(async () => {
    if (!('serviceWorker' in navigator) || !workboxInstance) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return;
    }
    log.info('Periodic update check...');
    await workboxInstance.update();

    if (registration.waiting && registration.active) {
      promptUserToUpdate(registration);
    }
  }, UPDATE_CHECK_INTERVAL);
}

// Reload the pwa when it is installed
window.addEventListener('appinstalled', () => {
  window.location.reload();
});
