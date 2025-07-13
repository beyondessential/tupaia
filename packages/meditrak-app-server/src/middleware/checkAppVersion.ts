import { RequestHandler } from 'express';

export const checkAppVersion: RequestHandler = async (req, _res, next) => {
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
