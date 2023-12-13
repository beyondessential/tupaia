/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DatatrakWebServerModelRegistry } from '../types';

const MAX_RECENT_ENTITIES = 3;

export async function addRecentEntity(models: DatatrakWebServerModelRegistry, userId: string, entityId: string) {
  const entity = await models.entity.findById(entityId);
  const user = await models.user.findById(userId);

  if (!entity) throw new Error(`Entity ${entityId} does not exist`);
  if (!user) throw new Error(`User ${userId} does not exist`);
  // Possibly null if looking at a project, which shouldn't be added to recent entities
  if (!entity.country_code) throw new Error(`Country code ${entity.country_code} does not exist`);

  // Casting to string because we know these values are defined
  // but typescript still complains when using them as indexes
  const countryCode = entity.country_code as string;
  const entityType = entity.type as string;

  const { recentEntities: allRecentEntities = {} } = user.preferences;
  if (!allRecentEntities?.[countryCode]) {
    allRecentEntities[countryCode] = {};
  }
  if (!allRecentEntities[countryCode][entityType]) {
    allRecentEntities[countryCode][entityType] = [];
  }

  const recentEntities = allRecentEntities[countryCode][entityType];
  // If the recent entities already contains this value exit early
  if (recentEntities.includes(entityId)) {
    return;
  }

  // Add the latest entity to front of array, cycle out the last entity if we are over the max
  const updatedEntities = [entityId, ...recentEntities.splice(0, MAX_RECENT_ENTITIES - 1)];
  allRecentEntities[countryCode][entityType] = updatedEntities;

  return models.user.updateById(userId, { preferences: { ...user.preferences, recentEntities: allRecentEntities } });
};
