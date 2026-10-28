export function getDisplayMode() {
  if (document.referrer.startsWith('android-app://')) return 'twa';
  if (window.matchMedia('(display-mode: browser)').matches) return 'browser';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches)
    return 'window-controls-overlay';

  return 'unknown';
}

/** `true` if web app, `false` if browser tab. */
const getIsWebApp = () => {
  const displayMode = getDisplayMode();
  return displayMode === 'standalone' || displayMode === 'minimal-ui';
};

/**
 * Fixed for the lifetime of the page. Chrome and Edge move the existing tab into the app window
 * when the PWA is installed (without reloading), so the display mode can change underneath us.
 * (Safari treats web app as a separate/sandboxed environment from the regular browser.) Re-
 * evaluating it only on React re-renders can cause components to disagree with each other about
 * whether the app is offline-first.
 */
const _isWebApp = getIsWebApp();

export const isWebApp = () => _isWebApp;

/**
 * Reloads the page if it switches between running in a browser tab and as a web app.
 */
export const reloadOnDisplayModeChange = () => {
  const onChange = () => {
    if (getIsWebApp() !== isWebApp()) window.location.reload();
  };
  window.matchMedia('(display-mode: minimal-ui)').addEventListener('change', onChange);
  window.matchMedia('(display-mode: standalone)').addEventListener('change', onChange);
};
