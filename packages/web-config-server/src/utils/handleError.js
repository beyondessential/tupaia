import winston from 'winston';
import { CustomError, InternalServerError } from '@tupaia/utils';

export const handleError = (err, req, res, next) => {
  // Keep the default error handler, it will stop connection if response is already being
  // sent and there are connection problems
  if (res && res.headersSent) {
    next(err);
    return;
  }

  let error = err;
  if (!error.respond) {
    // If the error does not already have a respond function, it hasn't been handled
    if (err instanceof SyntaxError) {
      error = new CustomError({
        description: 'illegal json in body',
        responseStatus: 400,
        responseText: 'illegal json in body',
        err,
      });
    } else {
      error = new InternalServerError(err);
    }
  }
  winston.error(err);
  error.respond(res);
};
