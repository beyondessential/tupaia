/**
 * This is the Jest-sanctioned workaround
 * @see https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// TODO: Set up database for testing later

jest.mock('@tupaia/database', () => ({
  migrate: jest.fn(),
  createDatabase: jest.fn().mockImplementation(() => ({
    models: {
      localSystemFact: {
        get: jest.fn().mockImplementation(arg => {
          if (arg === 'deviceId') {
            return 'test-device-id';
          }
          return undefined;
        }),
      },
    },
  })),
  ModelRegistry: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('./src/database/createDatabase', () => ({
  createDatabase: jest.fn().mockImplementation(() => ({
    models: {
      localSystemFact: {
        get: jest.fn().mockImplementation(arg => {
          if (arg === 'deviceId') {
            return 'test-device-id';
          }
          return undefined;
        }),
      },
    },
  })),
}));

jest.mock('./src/database/DatatrakDatabase', () => ({
  DatatrakDatabase: jest.fn().mockImplementation(() => ({})),
}));
