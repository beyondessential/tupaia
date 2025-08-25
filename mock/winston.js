const winston = {
  error: (message, meta) => console.error(message, meta),
  warn: (message, meta) => console.warn(message, meta),
  info: (message, meta) => console.info(message, meta),
  http: (message, meta) => console.log('[HTTP]', message, meta),
  verbose: (message, meta) => console.log('[VERBOSE]', message, meta),
  debug: (message, meta) => console.debug(message, meta),
  silly: (message, meta) => console.debug('[SILLY]', message, meta),

  // Mock logger creation methods
  createLogger: options => winston,
  configure: options => winston,

  // Mock format and transports
  format: {
    combine: (...args) => ({}),
    timestamp: options => ({}),
    errors: options => ({}),
    json: options => ({}),
    simple: () => ({}),
    colorize: options => ({}),
  },

  transports: {
    Console: class Console {
      constructor(options) {}
    },
    File: class File {
      constructor(options) {}
    },
    Http: class Http {
      constructor(options) {}
    },
  },
};

// Support both CommonJS and ES modules
export default winston;
export const {
  error,
  warn,
  info,
  http,
  verbose,
  debug,
  silly,
  createLogger,
  configure,
  format,
  transports,
} = winston;
