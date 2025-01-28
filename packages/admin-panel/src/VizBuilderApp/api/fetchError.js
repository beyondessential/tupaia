export default class FetchError extends Error {
  constructor(message, code, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super([message, ...params]);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }

    this.name = 'FetchError';
    // Custom debugging information
    this.code = code;
  }
}
