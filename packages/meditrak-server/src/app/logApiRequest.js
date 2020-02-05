/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

export const logApiRequest = async (req, res, next) => {
  const apiRequestLog = await req.database.create(TYPES.API_REQUEST_LOG, {
    version: req.version,
    endpoint: req.endpoint,
    user_id: req.userId,
  });
  req.apiRequestLogId = apiRequestLog.id;
  next();
};
