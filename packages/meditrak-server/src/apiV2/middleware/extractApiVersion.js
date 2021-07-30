/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { UnsupportedApiVersionError } from '@tupaia/utils';

const MINIMUM_API_VERSION = 2;

export const extractApiVersion = (req, res, next) => {
  if (!req.path.startsWith('/v')) {
    // A version of the apiV2 that should be on v2 but missing the version section of the url
    req.version = 2;
    req.endpoint = req.path;
  } else {
    const secondSlashIndex = req.path.indexOf('/', 2);
    req.version = parseFloat(req.path.substring(2, secondSlashIndex));
    req.endpoint = req.path.substring(secondSlashIndex);
  }
  if (!req.version || req.version < MINIMUM_API_VERSION) {
    throw new UnsupportedApiVersionError();
  }
  next();
};
