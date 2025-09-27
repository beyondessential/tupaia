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
        addProjectForSync: jest.fn(),
      },
    },
  })),
}));

jest.mock('./src/database/DatatrakDatabase', () => ({
  DatatrakDatabase: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('./src/api/DatabaseContext', () => {
  const React = require('react');
  
  return {
    DatabaseContext: React.createContext({}),
    DatabaseProvider: ({ children }) => children,
    useDatabaseContext: () => ({
      models: {
        localSystemFact: {
          get: jest.fn().mockResolvedValue('test-device-id'),
          set: jest.fn().mockResolvedValue(undefined),
        },
        closeDatabaseConnections: jest.fn(),
      },
    }),
  };
});

jest.mock('./src/api/SyncContext', () => {
  const React = require('react');
  
  return {
    SyncContext: React.createContext({}),
    SyncProvider: ({ children }) => children,
    useSyncContext: () => ({
      clientSyncManager: {
        triggerSync: jest.fn(),
      },
    }),
  };
});