import type { NextFunction, Request, Response } from 'express';
import semverNeq from 'semver/functions/neq';
import semverValid from 'semver/functions/valid';

import { version } from '../../package.json';

export const versionCompatibility = (req: Request, res: Response, next: NextFunction) => {
  const clientVersion = req.header('X-Client-Version');

  if (!clientVersion) {
    res.status(400).json({ error: 'Missing X-Client-Version header. This is required for sync.' });
    return;
  }

  if (semverValid(clientVersion) === null) {
    res.status(400).json({
      error: `Malformed X-Client-Version header. “${clientVersion}” isn’t a valid semver number.`,
    });
    return;
  }

  if (semverNeq(clientVersion, version)) {
    // Simple inequality check because Tupaia can assume server version ≥ client version. If server
    // version is different, then it is newer; and client is considered outdated.
    res.status(400).json({
      error: `Please reload to get the latest version of Tupaia DataTrak (v${version}) before syncing`,
    });
    return;
  }

  next();
};
