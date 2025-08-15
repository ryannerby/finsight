module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/types/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testTimeout: 10000,
  verbose: true,
  // Mock modules that cause issues in tests
  moduleNameMapper: {
    '^../config/supabase$': '<rootDir>/tests/__mocks__/supabase.ts',
    '^../lib/logger$': '<rootDir>/tests/__mocks__/logger.ts',
    '^../lib/env$': '<rootDir>/tests/__mocks__/env.ts'
  }
};
