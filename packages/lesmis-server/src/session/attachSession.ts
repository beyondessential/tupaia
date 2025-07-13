import { RequestHandler } from 'express';
import { attachSession as baseAttachSession } from '@tupaia/server-boilerplate';

export const attachSession: RequestHandler = async (req, res, next) => {
  await baseAttachSession(req, res, () => {
    // baseAttachSession might call next(err), we ignore it

    // within lesmis-server, not having a session means the route handlers will use the default
    // public lesmis server user auth header
    next();
  });
};
