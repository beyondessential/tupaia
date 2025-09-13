// TODO: Set up database for testing later

jest.mock('@tupaia/database', () => ({
  migrate: jest.fn(),
  createDatabase: jest.fn().mockImplementation(() => ({
    models: {},
  })),
  ModelRegistry: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('./src/database/createDatabase', () => ({
  createDatabase: jest.fn().mockImplementation(() => ({
    models: {},
  })),
}));

jest.mock('./src/database/DatatrakDatabase', () => ({
  DatatrakDatabase: jest.fn().mockImplementation(() => ({})),
}));
