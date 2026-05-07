import winston from 'winston';
import { ClosureCacheBuilder } from './ClosureCacheBuilder';

/**
 * Bootstrap the `ancestor_descendant_relation` closure cache on first start (or after
 * a fresh DB setup). If the cache is already populated, skip — incremental rebuilds
 * are handled by EntityHierarchyCacher's change listener.
 *
 * Function name is preserved for backwards compatibility with callers in
 * central-server. TUP-3068 redirected the work to the new ClosureCacheBuilder; the
 * separate `entity_parent_child_relation` cache is no longer maintained.
 */
export const buildEntityParentChildRelationIfEmpty = async models => {
  const closureCount = await models.ancestorDescendantRelation.count({});

  if (closureCount === 0) {
    winston.info('No existing ancestor_descendant_relation rows found. Building initial cache...');
    const builder = new ClosureCacheBuilder(models);
    await builder.rebuildAll();
    winston.info('Closure cache built');
    return;
  }

  winston.info('Existing ancestor_descendant_relation rows found. Skipping initial cache build.');
};
