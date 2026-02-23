import type { NextFunction, Request, Response } from 'express';

import { version } from '../../package.json'; // with { type: 'json' };

export const versionCompatibility = (req: Request, res: Response, next: NextFunction) => {
  console.log('🦺 [versionCompatibility]');
  const clientVersion = req.header('X-Client-Version');
  console.log('🦺 [versionCompatibility] clientVersion', clientVersion);

  if (!clientVersion) {
    console.log('🦺 [versionCompatibility] header missing');
    res.status(400).json({ error: 'Missing X-Client-Version header. This is required for sync.' });
    return;
  }

  // TODO: Comment why equality works here
  if (clientVersion !== version) {
    console.log('🦺 [versionCompatibility] bad version)');
    res.setHeader('X-Required-Client-Version', version);
    res.status(400).json({
      error: `Please reload to get the latest version of Tupaia DataTrak (v${version}) before syncing.`,
    });
    return;
  }

  next();
};
