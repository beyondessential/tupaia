import React from 'react';
import log from 'winston';
import { render as renderReactApp } from 'react-dom';

import { App } from './App';
import { confirmUpdate } from './components/UpdateConfirmation';
import { useIsOfflineFirst } from './api/offlineFirst';

// Global error handlers to catch unhandled errors
window.addEventListener('error', (event) => {
  console.group('🔴 Unhandled Error');
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error lineno:', event.lineno);
  console.error('Error colno:', event.colno);
  console.error('Error object:', event.error);
  console.error('Error stack:', event.error?.stack);
  console.groupEnd();
});

window.addEventListener('unhandledrejection', (event) => {
  console.group('🔴 Unhandled Promise Rejection');
  console.error('Reason:', event.reason);
  console.error('Reason message:', event.reason?.message);
  console.error('Reason stack:', event.reason?.stack);
  console.error('Promise:', event.promise);
  console.groupEnd();
});

renderReactApp(<App />, document.getElementById('root'));

const promptUserToUpdate = async (worker: ServiceWorker) => {
  if (await confirmUpdate()) {
    worker.postMessage({ type: 'SKIP_WAITING' });
  }
};

if (useIsOfflineFirst()) {
  window.addEventListener('load', async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      // Handle updates
      registration.addEventListener('updatefound', () => {
        log.info('Update found.');
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', async () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available
            await promptUserToUpdate(newWorker);
          }
        });
      });

      // Check if there's already a waiting worker
      // in case if update found, but user closes the pwa
      if (registration.waiting) {
        await promptUserToUpdate(registration.waiting);
      }

      // Check for updates immediately after loading the app
      log.info('Checking for updates...');
      await registration.update();

      // Important: Handle when new SW takes control
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
      }
    }
  }, UPDATE_CHECK_INTERVAL);
}

 // Reload the pwa when it is installed
 window.addEventListener('appinstalled', () => {
  window.location.reload();
});
