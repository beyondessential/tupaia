import React from 'react';
import log from 'winston';
import { render as renderReactApp } from 'react-dom';

import { App } from './App';
import { setUpdateReady } from './components/UpdateConfirmation';
import { useIsOfflineFirst } from './api/offlineFirst';
import { GA_CATEGORY, GA_EVENT, gaEvent, gaSetUserProperties } from './utils';
import { getDisplayMode } from './utils/displayMode';

renderReactApp(<App />, document.getElementById('root'));

// Set GA user properties on every session
gaSetUserProperties({
  displayMode: getDisplayMode(),
  app_version: process.env.REACT_APP_VERSION || 'unknown',
});

const promptUserToUpdate = (registration: ServiceWorkerRegistration) => {
  setUpdateReady(registration);
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
            promptUserToUpdate(registration);
          }
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && registration.active) {
            promptUserToUpdate(registration);
          }
        });

        // The worker may have reached 'installed' before the statechange listener
        // was attached above, so check its current state as well.
        if (newWorker.state === 'installed' && registration.active) {
          promptUserToUpdate(registration);
        }
      });

      // Check if there's already a waiting worker
      // in case if update found, but user closes the pwa
      if (registration.waiting) {
        promptUserToUpdate(registration);
      }

      // Check for updates immediately after loading the app
      log.info('Checking for updates...');
      await registration.update();
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
          promptUserToUpdate(registration);
        }
      }
    }
  }, UPDATE_CHECK_INTERVAL);
}

// Track and reload the pwa when it is installed
window.addEventListener('appinstalled', () => {
  gaEvent(GA_EVENT.APP_INSTALLED, GA_CATEGORY.APP);
  window.location.reload();
});
