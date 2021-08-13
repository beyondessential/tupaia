/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { respond } from './respond';
import { InternalServerError, logError } from './errors';

/**
 * Can be used by servers to handle errors caught in request processing.
 *
 * Responds to the http request in a standard format.
 *
 * Takes errors of any type specified in errors.js
 *
 * @param {Error} error
 * @param {Response} res
 */
export const serverErrorHandler = (error, res) => {
  const err = 'respond' in error ? error : new InternalServerError(error);

  logError(err);

  const { message, extraFields = {}, statusCode = 500 } = err;

  respond(res, { error: message, ...extraFields }, statusCode);
}