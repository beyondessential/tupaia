/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Response, NextFunction } from 'express';
import { ModelRegistry } from '@tupaia/database';
import { PsssSessionModel } from '../models';
import { PsssRequest } from '../types';

/**
 * Attach psss session model to the request
 */
export const attachModels = (models: ModelRegistry, sessionModel: PsssSessionModel) => (
  req: PsssRequest,
  res: Response,
  next: NextFunction,
) => {
  req.models = models;
  req.sessionModel = sessionModel; // typescript error because we have mutated the req
  next();
};
