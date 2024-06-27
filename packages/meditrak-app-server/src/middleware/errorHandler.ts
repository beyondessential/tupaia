/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { handleError } from '@tupaia/server-boilerplate';
import { formatApiErrorForFrontend } from '@tupaia/tsutils';
import { RespondingError } from '@tupaia/utils';
import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err: RespondingError | Error, req, res, next) => {
  err.message = formatApiErrorForFrontend(err.message); // Cleanup error messages that are sent to device
  handleError(err, req, res, next);
};
