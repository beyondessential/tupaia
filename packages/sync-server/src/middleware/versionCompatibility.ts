import type { Request, Response, NextFunction } from 'express';
import {
  SYNC_CLIENT_OUTDATED_ERROR_CODE,
  SYNC_CLIENT_VERSION_HEADER_MISSING_ERROR_CODE,
} from '@tupaia/constants';

import { version } from '../../package.json'; // with { type: 'json' };

export const versionCompatibility = (req: Request, res: Response, next: NextFunction) => {
  console.log('🦺 [versionCompatibility]');
  const clientVersion = req.header('X-Client-Version');
  console.log('🦺 [versionCompatibility] clientVersion', clientVersion);

  if (!clientVersion) {
    console.log('🦺 [versionCompatibility] header missing');
    res.status(400).json({ error: SYNC_CLIENT_VERSION_HEADER_MISSING_ERROR_CODE });
    return;
  }

  // TODO: Comment why equality works here
  if (clientVersion !== version) {
    console.log('🦺 [versionCompatibility] bad version)');
    res.setHeader('X-Required-Client-Version', version);
    res.status(400).json({ error: SYNC_CLIENT_OUTDATED_ERROR_CODE });
    return;
  }

  next();
};
