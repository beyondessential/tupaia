// TODO: Set up database for testing later
const { createDatabase } = require('./src/database/createDatabase');

global.importMeta = {
  glob: jest.fn().mockResolvedValue({}),
};

jest.mock('./src/database/createDatabase', () => ({
  createDatabase: jest.fn().mockResolvedValue({
    models: {},
  }),
}));
