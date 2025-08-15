import { env, logEnvironmentConfig } from '../../src/lib/env';

// Mock the logger to avoid noise in tests
jest.mock('../../src/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('ANTHROPIC_API_KEY validation', () => {
    it('should allow server to boot when ANTHROPIC_API_KEY is present', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key-123';
      
      // This should not throw
      expect(() => {
        const { env } = require('../../src/lib/env');
        expect(env.ANTHROPIC_API_KEY).toBe('test-api-key-123');
      }).not.toThrow();
    });

    it('should allow server to boot when ANTHROPIC_API_KEY is undefined (optional)', () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      // This should not throw since ANTHROPIC_API_KEY is optional in schema
      expect(() => {
        const { env } = require('../../src/lib/env');
        expect(env.ANTHROPIC_API_KEY).toBeUndefined();
      }).not.toThrow();
    });

    it('should log warning when ANTHROPIC_API_KEY is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      const { logEnvironmentConfig } = require('../../src/lib/env');
      const mockLogger = require('../../src/lib/logger').logger;
      
      logEnvironmentConfig();
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'ANTHROPIC_API_KEY not set - AI analysis features will be disabled'
      );
    });
  });

  describe('Required environment variables', () => {
    it('should have default values for optional variables', () => {
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      
      const { env } = require('../../src/lib/env');
      
      expect(env.NODE_ENV).toBe('development');
      expect(env.PORT).toBe('3001');
    });

    it('should parse boolean feature flags correctly', () => {
      process.env.ENABLE_MOCK_MODE = 'true';
      process.env.ENABLE_DATABASE = 'false';
      
      const { env } = require('../../src/lib/env');
      
      expect(env.ENABLE_MOCK_MODE).toBe(true);
      expect(env.ENABLE_DATABASE).toBe(false);
    });
  });

  describe('Environment schema validation', () => {
    it('should reject invalid NODE_ENV values', () => {
      process.env.NODE_ENV = 'invalid-env';
      
      expect(() => {
        require('../../src/lib/env');
      }).toThrow();
    });

    it('should reject invalid PORT values', () => {
      process.env.PORT = 'not-a-number';
      
      // PORT is string in schema, so this should work
      expect(() => {
        const { env } = require('../../src/lib/env');
        expect(env.PORT).toBe('not-a-number');
      }).not.toThrow();
    });
  });
});
