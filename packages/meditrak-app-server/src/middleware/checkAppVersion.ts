/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';

export const checkAppVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appVersion } = req.query;
    if (!appVersion) {
      throw new Error('appVersion unspecified, please upgrade your app');
    }

    next();
  } catch (err) {
    next(err);
  }
};
