jest.mock('@tupaia/database', () => ({
  createDatabase: jest.fn().mockResolvedValue({
    models: {},
  }),
}));
