const winston = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  log: console.log,
  http: console.log,
  verbose: console.log,
  debug: console.debug,
};

// Support both CommonJS and ES modules
export default winston;
export const {
  error,
  warn,
  info,
  log,
  http,
  verbose,
  debug,
} = winston;
