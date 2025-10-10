import React from 'react';
import { render as renderReactApp } from 'react-dom';
import { App } from './App';

renderReactApp(<App />, document.getElementById('root'));

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available
            if (confirm('New version available! Update now?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });

        // Check for updates
        registration.update();
      });
    });
  }
});

window.addEventListener('appinstalled', () => {
  window.location.reload();
});
