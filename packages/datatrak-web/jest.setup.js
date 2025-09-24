import './src/__tests__/mocks/matchMedia.mock'; // Import before components under test

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
