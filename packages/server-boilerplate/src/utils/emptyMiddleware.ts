/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { RequestHandler } from 'express';

// Does nothing and skips to the next
export const emptyMiddleware: RequestHandler = (req, res, next) => {
  next();
};
