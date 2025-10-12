import './src/__tests__/mocks/matchMedia.mock';

const mockModels = {
  localSystemFact: {
    get: jest.fn().mockResolvedValue('test-device-id'),
    set: jest.fn().mockResolvedValue(undefined),
    addProjectForSync: jest.fn(),
  },
  closeDatabaseConnections: jest.fn(),
};

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

jest.mock('./src/api/CurrentUserContext', () => {
  const actual = jest.requireActual('./src/api/CurrentUserContext');

  return {
    ...actual,
    useCurrentUserContext: jest.fn(() => ({
      ...actual.useCurrentUserContext(), // Get the actual return value
      accessPolicy: {}, // Override just this property
    })),
  };
});

// TODO: Set up database for testing later
jest.mock('./src/api/DatabaseContext', () => {
  const React = require('react');

  return {
    DatabaseContext: React.createContext({
      models: mockModels,
    }),
    DatabaseProvider: ({ children }) => children,
    useDatabaseContext: () => ({
      models: mockModels,
    }),
  };
});

jest.mock('./src/api/SyncContext', () => {
  const React = require('react');

  return {
    SyncContext: React.createContext({
      clientSyncManager: {
        triggerSync: jest.fn(),
      },
    }),
    SyncProvider: ({ children }) => children,
    useSyncContext: () => ({
      clientSyncManager: {
        triggerSync: jest.fn(),
      },
    }),
  };
});
