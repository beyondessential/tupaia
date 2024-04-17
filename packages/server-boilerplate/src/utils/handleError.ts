/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { InternalServerError, RespondingError } from '@tupaia/utils';
import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

export const handleError = (
  err: RespondingError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // use default if response is already being sent and there are connection problems
  if (res && res.headersSent) {
    next(err);
    return;
  }

  const error = 'respond' in err ? err : new InternalServerError(err);
  winston.error(error);
  error.respond(res);
};
