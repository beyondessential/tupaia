export default {
  clearMocks: true,
  testMatch: ['<rootDir>/src/__tests__/**/**.test.tsx'],
  setupFilesAfterEnv: ['../../jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
  testTimeout: 30000,
  preset: 'ts-jest',
};
