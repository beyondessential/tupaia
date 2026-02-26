import type { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import semverNeq from 'semver/functions/neq';
import semverValid from 'semver/functions/valid';

/**
 * @privateRemarks Cannot use simple static…
 *
 * ```js
 * import { version } from '../../package.json' with { type: 'json' }
 * ```
 *
 * …because it would force the manifest file to be included in the build output and throw off the
 * `main` entrypoint when we point Node (or PM2) to `dist/`:
 *
 * ```txt
 * 📂 packages/sync-server/
 * ├─ 📂 dist/
 * │  ├─ 📁 src/
 * │  └─ 📄 package.json 👈 Inside `dist/` but would still have `"main": "dist/index.js"` entry!
 * └─ 📁 src/
 * ```
 *
 * This approach “peeks” outside the `dist/` into the source `packages/sync-server/package.json`;
 * but retains the expected build output where `dist/` has the same structure as `src/`.
 */
const manifest = readFileSync(join(__dirname, '../../package.json'), 'utf8');
const { version } = JSON.parse(manifest);

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
