/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { ServerBoilerplateModelRegistry } from '../../types';

export const logApiRequest = (
  models: ServerBoilerplateModelRegistry,
  apiName: string,
  version: number,
) => async (req: Request, res: Response, next: NextFunction) => {
  const { session } = req;
  const refreshToken = session?.refresh_token;
  const userId = session ? (await models.user.findOne({ email: session.email })).id : undefined;
  const { id: apiRequestLogId } = await models.apiRequestLog.create({
    version,
    api: apiName,
    method: req.method,
    endpoint: req.path,
    query: req.query,
    user_id: userId,
    refresh_token: refreshToken,
  });
  req.apiRequestLogId = apiRequestLogId;
  next();
};
