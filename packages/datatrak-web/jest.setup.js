// TODO: Set up database for testing later

jest.mock('@tupaia/database', () => ({
  migrate: jest.fn(),
  ModelRegistry: jest.fn().mockImplementation(() => ({})),
}));
