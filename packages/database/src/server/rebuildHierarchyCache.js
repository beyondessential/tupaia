/**
 * One-shot script: force a full rebuild of `ancestor_descendant_relation` per project.
 *
 * Use this after deploying TUP-3056 to a database that already has stale closure-cache
 * rows from the pre-TUP-3068 cacher (the bootstrap helper skips when rows are present,
 * and incremental rebuilds via the change handler only trigger on entity / project_country
 * changes — they don't repair pre-existing stale rows).
 *
 * Usage:
 *   yarn workspace @tupaia/database rebuild-hierarchy-cache
 */

import { ModelRegistry } from '../core';
import { modelClasses } from '../core/modelClasses';
import { TupaiaDatabase } from './TupaiaDatabase';
import { ClosureCacheBuilder } from './changeHandlers/entityHierarchyCacher/ClosureCacheBuilder';
import { configureEnv } from './configureEnv';

configureEnv();

(async () => {
  const database = new TupaiaDatabase();
  const models = new ModelRegistry(database, modelClasses);

  const builder = new ClosureCacheBuilder(models);
  const projects = await models.project.all();
  // eslint-disable-next-line no-console
  console.log(`[rebuild-hierarchy-cache] Rebuilding closure cache for ${projects.length} projects…`);

  const t0 = Date.now();
  for (const [i, project] of projects.entries()) {
    const t = Date.now();
    await builder.rebuildForProject(project.id);
    // eslint-disable-next-line no-console
    console.log(
      `  [${i + 1}/${projects.length}] ${project.code} rebuilt in ${((Date.now() - t) / 1000).toFixed(1)}s`,
    );
  }
  // eslint-disable-next-line no-console
  console.log(
    `[rebuild-hierarchy-cache] Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
  process.exit(0);
})().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
