import type { NextFunction, Request, Response } from 'express';

import { version } from '../../package.json'; // with { type: 'json' };

export const versionCompatibility = (req: Request, res: Response, next: NextFunction) => {
  const clientVersion = req.header('X-Client-Version');

  if (!clientVersion) {
    res.status(400).json({ error: 'Missing X-Client-Version header. This is required for sync.' });
    return;
  }

  // Simple inequality check because Tupaia can assume server version ≥ client version. If server
  // version is different, then it is newer; and client is considered outdated.
  if (clientVersion !== version) {
    res.setHeader('X-Required-Client-Version', version);
    res.status(400).json({
      error: `Please reload to get the latest version of Tupaia DataTrak (v${version}) before syncing.`,
    });
    return;
  }

  next();
};
