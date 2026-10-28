type DisplayModeModule = typeof import('../../utils/displayMode');

describe('displayMode', () => {
  let displayMode: string;
  let changeListeners: { query: string; listener: () => void }[];
  const originalLocation = window.location;
  const reload = jest.fn();

  // Each test gets a fresh copy of the module, so `isWebApp` is evaluated against that test’s
  // display mode
  const loadModule = (): DisplayModeModule => {
    let module: DisplayModeModule | undefined;
    jest.isolateModules(() => {
      module = require('../../utils/displayMode');
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

  describe('isWebApp', () => {
    it('is false in a browser tab', () => {
      expect(loadModule().isWebApp()).toBe(false);
    });

    it('is false in a fullscreen browser tab', () => {
      displayMode = 'fullscreen';
      expect(loadModule().isWebApp()).toBe(false);
    });

    it('is true when running as an installed app', () => {
      displayMode = 'standalone';
      expect(loadModule().isWebApp()).toBe(true);
    });

    it('keeps its initial value if the display mode changes', () => {
      const { isWebApp } = loadModule();
      expect(isWebApp()).toBe(false);

      displayMode = 'standalone';
      expect(isWebApp()).toBe(false);
    });
  });

  describe('reloadOnDisplayModeChange', () => {
    it('reloads when a browser tab becomes an installed app', () => {
      loadModule().reloadOnDisplayModeChange();

      switchDisplayMode('standalone');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when an installed app is moved back into a browser tab', () => {
      displayMode = 'standalone';
      loadModule().reloadOnDisplayModeChange();

      switchDisplayMode('browser');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('reloads when a fullscreen browser tab becomes an installed app', () => {
      displayMode = 'fullscreen';
      loadModule().reloadOnDisplayModeChange();

      switchDisplayMode('standalone');
      expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does not reload when a browser tab enters or leaves fullscreen', () => {
      loadModule().reloadOnDisplayModeChange();

      switchDisplayMode('fullscreen');
      switchDisplayMode('browser');
      expect(reload).not.toHaveBeenCalled();
    });

    it('does not reload when switching between installed app display modes', () => {
      displayMode = 'standalone';
      loadModule().reloadOnDisplayModeChange();

      switchDisplayMode('minimal-ui');
      switchDisplayMode('standalone');
      expect(reload).not.toHaveBeenCalled();
    });
  });
});
