import winston from 'winston';
import { AncestorDescendantCacheBuilder } from './AncestorDescendantCacheBuilder';

export const buildEntityParentChildRelationIfEmpty = async models => {
  const closureCount = await models.ancestorDescendantRelation.count({});

  if (closureCount === 0) {
    winston.info('No existing ancestor_descendant_relation rows found. Building initial cache...');
    const builder = new AncestorDescendantCacheBuilder(models);
    await builder.rebuildAll();
    winston.info('Closure cache built');
    return;
  }

  winston.info('Existing ancestor_descendant_relation rows found. Skipping initial cache build.');
};
