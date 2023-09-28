export default {
  clearMocks: true,
  testMatch: ['<rootDir>/src/__tests__/**/**.test.tsx'],
  setupFilesAfterEnv: ['../../jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!(axios)/)'],
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
