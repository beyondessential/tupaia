/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { ServerBoilerplateModelRegistry } from '../../types';

// Matches the version number in the url
const versionRegex = /\/v(?<version>[0-9]+)\//;

export const logApiRequest =
  (models: ServerBoilerplateModelRegistry, apiName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, method, path, query } = req;
    const userId = user?.id;
    const match = path.match(versionRegex);
    const version = match && match.groups ? parseInt(match.groups.version) : 1; // Default to version 1 if url doesn't match
    const { id: apiRequestLogId } = await models.apiRequestLog.create({
      version,
      api: apiName,
      method,
      endpoint: path,
      query,
      user_id: userId,
    });
    req.apiRequestLogId = apiRequestLogId;
    next();
  };
