import winston from 'winston';
import { EntityParentChildRelationBuilder } from './EntityParentChildRelationBuilder';

export const buildEntityParentChildRelationIfEmpty = async models => {
  const entityParentChildRelationCount = await models.entityParentChildRelation.count({});

  if (entityParentChildRelationCount === 0) {
    winston.info(
      'No existing entity parent-child relations found. Building initial hierarchy...',
      entityParentChildRelationCount,
    );
    const entityParentChildRelationBuilder = new EntityParentChildRelationBuilder(models);
    await entityParentChildRelationBuilder.buildAndCacheHierarchies();
  }
};
