// Simple test script to verify logging works
const { logger, generateRequestId, createRequestLogger } = require('./dist/lib/logger');

console.log('Testing logger...');

// Test basic logging
logger.info('Basic info message');
logger.warn('Basic warning message');
logger.error('Basic error message');

// Test request ID generation
const requestId = generateRequestId();
console.log('Generated request ID:', requestId);

// Test request logger
const requestLogger = createRequestLogger(requestId);
requestLogger.info('Request-specific message');
requestLogger.error('Request-specific error');

console.log('Logging test completed!');
