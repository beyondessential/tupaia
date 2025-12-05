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

const mockModels = {
  localSystemFact: {
    get: jest.fn().mockResolvedValue('test-device-id'),
    set: jest.fn().mockResolvedValue(undefined),
    addProjectForSync: jest.fn(),
  },
  user: {
    findOne: jest.fn().mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    }),
    create: jest.fn(),
    update: jest.fn(),
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
      user: {
        findOne: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
        }),
        create: jest.fn(),
        update: jest.fn(),
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
      accessPolicy: {
        allowsSome: jest.fn().mockReturnValue(true),
      }, // Override just this property
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
