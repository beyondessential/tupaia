type DataModeModule = typeof import('../../utils/dataMode');

describe('dataMode', () => {
  const STORAGE_KEY = 'dataMode';

  let displayMode: string;
  let changeListeners: { query: string; listener: () => void }[];
  const originalLocation = window.location;
  const reload = jest.fn();

  // Each test gets a fresh copy of the module, so the data mode is evaluated against that test’s
  // display mode
  const loadModule = (): DataModeModule => {
    let module: DataModeModule | undefined;
    jest.isolateModules(() => {
      module = require('../../utils/dataMode');
    });
    return module!;
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
        removeEventListener: jest.fn(),
      })),
    });
  });

  afterEach(() => {
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

  describe('reloadOnDataModeChange', () => {
    it('reloads when a browser tab becomes an installed app', () => {
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('standalone');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when an installed app is moved back into a browser tab', () => {
      displayMode = 'standalone';
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('browser');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when a fullscreen browser tab becomes an installed app', () => {
      displayMode = 'fullscreen';
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('standalone');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when a fullscreen installed app is moved into a browser tab', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      displayMode = 'fullscreen';
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('browser');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not reload when a browser tab enters or leaves fullscreen', () => {
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('fullscreen');
      switchDisplayMode('browser');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when an installed app enters or leaves fullscreen', () => {
      displayMode = 'standalone';
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('fullscreen');
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBe('offlineFirst');
      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when an installed app opened in fullscreen leaves fullscreen', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'offlineFirst');
      displayMode = 'fullscreen';
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when switching between installed app display modes', () => {
      displayMode = 'standalone';
      loadModule().reloadOnDataModeChange();

      switchDisplayMode('minimal-ui');
      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
