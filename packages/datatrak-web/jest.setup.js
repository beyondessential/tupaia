// TODO: Set up database for testing later
const { TextDecoder, TextEncoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('@tupaia/database', () => ({
  createDatabase: jest.fn().mockResolvedValue({
    models: {},
  }),
  BaseDatabase: jest.fn().mockImplementation(() => ({
    connection: jest.fn(),
  })),
  ModelRegistry: jest.fn().mockImplementation(() => ({})),
  MigrationManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    migrate: jest.fn(),
  })),
}));
