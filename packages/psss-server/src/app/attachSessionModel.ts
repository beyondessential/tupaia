/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Request, Response, NextFunction } from 'express';
import { PsssSessionModel } from '../models';

/**
 * Attach psss session model to the request
 */
export const attachSessionModel = (sessionModel: PsssSessionModel) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.sessionModel = sessionModel; // typescript error because we have mutated the req
  next();
};
