/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { extractRefreshTokenFromReq } from '@tupaia/auth';

export const logApiRequest = async (req, res, next) => {
  const refreshToken = await extractRefreshTokenFromReq(req);
  const { id: apiRequestLogId } = await req.models.apiRequestLog.create({
    version: req.version,
    endpoint: req.endpoint,
    user_id: req.userId,
    query: req.query,
    refresh_token: refreshToken,
  });
  req.apiRequestLogId = apiRequestLogId;
  req.refreshToken = refreshToken;

  next();
};
