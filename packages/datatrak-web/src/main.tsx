import React from 'react';
import log from 'winston';
import { render as renderReactApp } from 'react-dom';

import { App } from './App';
import { confirm } from './components/UpgradeConfirmation';

renderReactApp(<App />, document.getElementById('root'));

window.addEventListener('load', async () => {
  await confirm();

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
          
          if (await confirm()) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    });

    // Check if there's already a waiting worker
    // in case if update found, but user closes the pwa
    if (registration.waiting) {
      if (await confirm()) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
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

// Add periodic update checks for PWAs (every 5 seconds)
const UPDATE_CHECK_INTERVAL = 5000;

setInterval(async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      log.info('Periodic update check...');
      await registration.update();
    }
  }
}, UPDATE_CHECK_INTERVAL);

