import React from 'react';
import log from 'winston';
import { render as renderReactApp } from 'react-dom';

import { App } from './App';
import { setWaitingWorker } from './components/UpdateConfirmation';
import { useIsOfflineFirst } from './api/offlineFirst';

renderReactApp(<App />, document.getElementById('root'));

const promptUserToUpdate = (worker: ServiceWorker) => {
  setWaitingWorker(worker);
};

if (useIsOfflineFirst()) {
  window.addEventListener('load', async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none',
      });
      // When the browser detects a new service worker version, it fires 'updatefound'.
      registration.addEventListener('updatefound', () => {
        log.info('Update found.');
        const newWorker = registration.installing;

        // The worker may have already passed the 'installing' state by the time this
        // handler runs. Fall back to checking the waiting worker.
        if (!newWorker) {
          if (registration.waiting && registration.active) {
            promptUserToUpdate(registration.waiting);
          }
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && registration.active) {
            promptUserToUpdate(newWorker);
          }
        });

        // The worker may have reached 'installed' before the statechange listener
        // was attached above, so check its current state as well.
        if (newWorker.state === 'installed' && registration.active) {
          promptUserToUpdate(newWorker);
        }
      });

      // Check if there's already a waiting worker
      // in case if update found, but user closes the pwa
      if (registration.waiting) {
        promptUserToUpdate(registration.waiting);
      }

      // Check for updates immediately after loading the app
      log.info('Checking for updates...');
      await registration.update();

      // After the user confirms the update, the waiting SW calls skipWaiting(),
      // becomes active, and 'controllerchange' fires — reload to use the new version.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  });

  // Add periodic update checks for PWAs (every 1 minute)
  const UPDATE_CHECK_INTERVAL = 60 * 1000;

  setInterval(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        log.info('Periodic update check...');
        await registration.update();

        // Catch any waiting worker that the updatefound handler may have missed
        if (registration.waiting && registration.active) {
          promptUserToUpdate(registration.waiting);
        }
      }
    }
  }, UPDATE_CHECK_INTERVAL);
}

// Reload the pwa when it is installed
window.addEventListener('appinstalled', () => {
  window.location.reload();
});
