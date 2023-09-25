/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import semverCompare from 'semver-compare';

const MINIMUM_SUPPORTED_APP_VERSION = '1.7.107';

export const checkAppVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appVersion } = req.query;
    if (!appVersion) {
      throw new Error('appVersion unspecified, please upgrade your app');
    }

    if (typeof appVersion !== 'string') {
      throw new Error(`appVersion must be a string`);
    }

    if (semverCompare(appVersion, MINIMUM_SUPPORTED_APP_VERSION) < 0) {
      throw new Error(
        `appVersion ${appVersion} is no longer supported. Please upgrade your Meditrak App from the Play Store`,
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
