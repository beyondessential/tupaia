type DataModeModule = typeof import('../../utils/dataMode');
type RenderHook = typeof import('@testing-library/react-hooks/pure').renderHook;

describe('dataMode', () => {
  const STORAGE_KEY = 'datatrak.dataMode';

  let displayMode: string;
  let changeListeners: { query: string; listener: () => void }[];
  const originalLocation = window.location;
  const reload = jest.fn();

  let unmountCallbacks: (() => void)[];

  // Each test gets a fresh copy of the module, so the data mode is evaluated against that test’s
  // display mode. `renderHook` must come from the same copy of React as the module’s hooks. (The
  // `pure` entry point doesn’t register its own `afterEach` cleanup, which can’t be done mid-test.)
  const loadModule = (): DataModeModule & { renderHook: RenderHook } => {
    let module: DataModeModule | undefined;
    let isolatedRenderHook: RenderHook | undefined;
    jest.isolateModules(() => {
      module = require('../../utils/dataMode');
      ({ renderHook: isolatedRenderHook } = require('@testing-library/react-hooks/pure'));
    });
    const renderHook = ((...args: Parameters<RenderHook>) => {
      const result = isolatedRenderHook!(...args);
      unmountCallbacks.push(result.unmount);
      return result;
    }) as RenderHook;
    return { ...module!, renderHook };
  };

  const mountReloadHook = () => {
    const { renderHook, useReloadOnDataModeChange } = loadModule();
    return renderHook(() => useReloadOnDataModeChange());
  };

  const matches = (query: string) => query === `(display-mode: ${displayMode})`;

  // Like a real browser, only notifies listeners whose media query’s match changed
  const switchDisplayMode = (newDisplayMode: string) => {
    const previouslyMatched = changeListeners.map(({ query }) => matches(query));
    displayMode = newDisplayMode;
    changeListeners.forEach(({ query, listener }, i) => {
      if (matches(query) !== previouslyMatched[i]) listener();
    });
  };

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  beforeEach(() => {
    displayMode = 'browser';
    changeListeners = [];
    unmountCallbacks = [];
    reload.mockClear();
    window.sessionStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        get matches() {
          return matches(query);
        },
        media: query,
        addEventListener: (_event: string, listener: () => void) => {
          changeListeners.push({ query, listener });
        },
        removeEventListener: (_event: string, listener: () => void) => {
          changeListeners = changeListeners.filter(
            entry => entry.query !== query || entry.listener !== listener,
          );
        },
      })),
    });
  });

  afterEach(() => {
    for (const unmount of unmountCallbacks) unmount();
    jest.restoreAllMocks();
  });

  describe('getDataMode', () => {
    it('is online in a browser tab', () => {
      expect(loadModule().getDataMode()).toBe('online');
    });

    it('is offline-first when running as an installed app', () => {
      displayMode = 'standalone';
      expect(loadModule().getDataMode()).toBe('offlineFirst');
    });

    it('is online in fullscreen if nothing is known about this page', () => {
      displayMode = 'fullscreen';
      expect(loadModule().getDataMode()).toBe('online');
    });

    it('uses the last known data mode in fullscreen', () => {
      displayMode = 'fullscreen';

      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      expect(loadModule().getDataMode()).toBe('offlineFirst');

      window.sessionStorage.setItem(STORAGE_KEY, 'online');
      expect(loadModule().getDataMode()).toBe('online');
    });

    it('ignores an invalid stored data mode', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
      displayMode = 'fullscreen';
      expect(loadModule().getDataMode()).toBe('online');
    });

    it('prefers the display mode over the last known data mode', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'online');
      displayMode = 'standalone';
      expect(loadModule().getDataMode()).toBe('offlineFirst');

      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      displayMode = 'browser';
      expect(loadModule().getDataMode()).toBe('online');
    });

    it('remembers the data mode when the display mode tells us', () => {
      displayMode = 'standalone';
      loadModule();
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('offlineFirst');

      displayMode = 'browser';
      loadModule();
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('online');
    });

    it('keeps the last known data mode in fullscreen', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      displayMode = 'fullscreen';
      loadModule();
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('offlineFirst');
    });

    it('still works if storage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      displayMode = 'standalone';
      expect(loadModule().getDataMode()).toBe('offlineFirst');

      displayMode = 'fullscreen';
      expect(loadModule().getDataMode()).toBe('online');
    });

    it('keeps its initial value if the display mode changes', () => {
      const { getDataMode } = loadModule();
      expect(getDataMode()).toBe('online');

      displayMode = 'standalone';
      expect(getDataMode()).toBe('online');
    });
  });

  describe('useReloadOnDataModeChange', () => {
    it('reloads when a browser tab becomes an installed app', () => {
      mountReloadHook();

      switchDisplayMode('standalone');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when an installed app is moved back into a browser tab', () => {
      displayMode = 'standalone';
      mountReloadHook();

      switchDisplayMode('browser');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when a fullscreen browser tab becomes an installed app', () => {
      displayMode = 'fullscreen';
      mountReloadHook();

      switchDisplayMode('standalone');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when a fullscreen installed app is moved into a browser tab', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      displayMode = 'fullscreen';
      mountReloadHook();

      switchDisplayMode('browser');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not reload when a browser tab enters or leaves fullscreen', () => {
      mountReloadHook();

      switchDisplayMode('fullscreen');
      switchDisplayMode('browser');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when an installed app enters or leaves fullscreen', () => {
      displayMode = 'standalone';
      mountReloadHook();

      switchDisplayMode('fullscreen');
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('offlineFirst');
      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when an installed app opened in fullscreen leaves fullscreen', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      displayMode = 'fullscreen';
      mountReloadHook();

      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when switching between installed app display modes', () => {
      displayMode = 'standalone';
      mountReloadHook();

      switchDisplayMode('minimal-ui');
      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });

    it('reloads on mount if the data mode changed since the module loaded', () => {
      const { renderHook, useReloadOnDataModeChange } = loadModule();
      displayMode = 'standalone';

      renderHook(() => useReloadOnDataModeChange());
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not reload on mount if the data mode is unchanged', () => {
      mountReloadHook();
      expect(reload).not.toHaveBeenCalled();
    });

    it('stops listening once unmounted', () => {
      const { unmount } = mountReloadHook();
      unmount();

      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
