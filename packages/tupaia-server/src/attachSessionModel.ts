/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { Response, NextFunction } from 'express';
import { SessionModel } from './Session';
import { TupaiaRequest } from './types';

/**
 * Attach lesmis session model to the request
 */
export const attachSessionModel = (sessionModel: SessionModel) => (
  req: TupaiaRequest,
  res: Response,
  next: NextFunction,
) => {
  req.sessionModel = sessionModel; // typescript error because we have mutated the req
  next();
};
