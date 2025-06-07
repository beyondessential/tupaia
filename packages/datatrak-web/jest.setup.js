// TODO: Set up database for testing later

jest.mock('./src/database/createDatabase', () => ({
  createDatabase: jest.fn().mockResolvedValue({
    models: {},
  }),
}));
