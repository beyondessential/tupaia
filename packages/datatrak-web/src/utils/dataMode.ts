import { getDisplayMode } from './displayMode';

/**
 * Whether the app talks to the server directly (`online`), or reads from and writes to the local
 * database, delegating to sync for persisting data to the remote database (`offlineFirst`).
 */
export type DataMode = 'online' | 'offlineFirst';

/**
 * `offlineFirst` in a web app, `online` in a browser tab, `unknown` if the display mode can’t tell
 * us. Both a browser tab and a web app can be in `fullscreen`.
 */
const detectDataMode = (): DataMode | 'unknown' => {
  switch (getDisplayMode()) {
    case 'standalone':
    case 'minimal-ui':
      return 'offlineFirst';
    case 'browser':
    case 'twa':
      return 'online';
    default:
      return 'unknown';
  }
};

const DATA_MODE_STORAGE_KEY = 'datatrak.dataMode';

const readStoredDataMode = (): DataMode | 'unknown' => {
  try {
    const value = window.sessionStorage.getItem(DATA_MODE_STORAGE_KEY);
    if (value === 'online' || value === 'offlineFirst') return value;
  } catch {
    // Storage can be unavailable (e.g. site data blocked)
  }
  return 'unknown';
};

const storeDataMode = (dataMode: DataMode) => {
  try {
    window.sessionStorage.setItem(DATA_MODE_STORAGE_KEY, dataMode);
  } catch {
    // Storage can be unavailable (e.g. site data blocked)
  }
};

/** Like {@link detectDataMode}, but remembers the result whenever the display mode can tell us. */
const resolveDataMode = (): DataMode | 'unknown' => {
  const detected = detectDataMode();
  if (detected !== 'unknown') storeDataMode(detected);
  return detected;
};

const getInitialDataMode = (): DataMode => {
  const detected = resolveDataMode();
  if (detected !== 'unknown') return detected;

  const stored = readStoredDataMode();
  if (stored !== 'unknown') return stored;

  return 'online';
};

/**
 * Fixed for the lifetime of the page. Chrome and Edge move the existing tab into the app window
 * when the PWA is installed (without reloading), so the display mode can change underneath us.
 * (Safari treats web app as a separate/sandboxed environment from the regular browser.) Re-
 * evaluating it only on React re-renders can cause components to disagree with each other about
 * the data mode.
 *
 * If the display mode can’t tell us (`fullscreen`), falls back to the last known data mode for this
 * page, kept in `sessionStorage` because it follows the page when Chrome moves it between a tab and
 * the app window. Failing that, assumes `online`, as being offline-first in a browser tab is worse
 * than being online in the web app.
 */
const _dataMode = getInitialDataMode();

export const getDataMode = (): DataMode => _dataMode;

/**
 * Reloads the page if its data mode changes, i.e. it switches between running in a browser tab and
 * as a web app. Entering `fullscreen` is ignored, as it doesn’t tell us which one we’re in.
 */
export const reloadOnDataModeChange = () => {
  let isReloading = false;
  // A single switch can change more than one of the media queries below
  const onChange = () => {
    const detected = resolveDataMode();
    if (isReloading || detected === 'unknown' || detected === getDataMode()) return;
    isReloading = true;
    window.location.reload();
  };
  window.matchMedia('(display-mode: browser)').addEventListener('change', onChange);
  window.matchMedia('(display-mode: minimal-ui)').addEventListener('change', onChange);
  window.matchMedia('(display-mode: standalone)').addEventListener('change', onChange);
};
