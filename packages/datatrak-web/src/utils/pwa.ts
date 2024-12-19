/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

function getPWADisplayMode() {
  if (document.referrer.startsWith('android-app://')) return 'twa';
  if (window.matchMedia('(display-mode: browser)').matches) return 'browser';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches)
    return 'window-controls-overlay';

  return 'unknown';
}

export const isPWA = () => {
  const displayMode = getPWADisplayMode();
  return (
    getPWADisplayMode() === 'standalone' ||
    getPWADisplayMode() === 'fullscreen' ||
    getPWADisplayMode() === 'minimal-ui'
  );
};
