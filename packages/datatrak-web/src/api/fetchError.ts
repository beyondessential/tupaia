/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
export default class FetchError extends Error {
  public code: number;
  public name: string;
  public responseData: Record<string, unknown> | undefined;

  constructor(
    message: Error['message'],
    code: number,
    responseData?: Record<string, unknown>,
    ...params: ErrorOptions[]
  ) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message, ...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }

    this.name = 'FetchError';
    // Custom debugging information
    this.code = code;
    this.responseData = responseData;
  }
}
