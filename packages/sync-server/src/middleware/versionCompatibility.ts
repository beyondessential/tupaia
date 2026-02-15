import { Request, Response, NextFunction } from 'express';
import { SYNC_VERSION_INCOMPATIBLE_ERROR } from '@tupaia/constants';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version: SERVER_VERSION } = require('../../package.json') as { version: string };

/**
 * Middleware that rejects sync requests when the client version does not exactly match
 * the sync-server version. This ensures data integrity by only allowing sync from
 * clients that are on the same version as the server.
 *
 * The client is expected to send its version in the X-Client-Version header.
 * We only need to check that the client matches (client is never newer than server).
 */
export const versionCompatibility = (req: Request, res: Response, next: NextFunction) => {
  const clientVersion = req.header('X-Client-Version');

  if (!clientVersion || clientVersion !== SERVER_VERSION) {
    res.setHeader('X-Required-Client-Version', SERVER_VERSION);
    res.status(400).json({ error: SYNC_VERSION_INCOMPATIBLE_ERROR });
    return;
  }

  next();
};
