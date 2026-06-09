import winston from 'winston';
import { EntityParentChildRelationBuilder } from './EntityParentChildRelationBuilder';

export const buildEntityParentChildRelationIfEmpty = async models => {
  const entityParentChildRelationCount = await models.entityParentChildRelation.count({});

  if (entityParentChildRelationCount === 0) {
    winston.info(
      'No existing entity parent-child relations found. Building initial hierarchy...',
      entityParentChildRelationCount,
    );
    await models.wrapInTransaction(async transactingModels => {
      const entityParentChildRelationBuilder = new EntityParentChildRelationBuilder(
        transactingModels,
      );
      await entityParentChildRelationBuilder.buildAndCacheHierarchies();
    });
    winston.info('Entity parent-child relations built');

    return;
  }

  winston.info('Existing entity parent-child relations found. Skipping hierarchy build.');
};
