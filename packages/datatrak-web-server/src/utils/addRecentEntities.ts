import { DatatrakWebServerModelRegistry } from '../types';

const MAX_RECENT_ENTITIES = 3;

export async function addRecentEntities(
  models: DatatrakWebServerModelRegistry,
  userId: string,
  entityIds: string[],
) {
  if (!entityIds || !entityIds.length) return;

  const user = await models.user.findById(userId);
  if (!user) throw new Error(`User ${userId} does not exist`);

  const { recent_entities: allRecentEntities = {} } = user.preferences;

  for (const entityId of entityIds) {
    const entity = await models.entity.findById(entityId);
    if (!entity) throw new Error(`Entity ${entityId} does not exist`);

    // Possibly null if looking at a project, which shouldn't be added to recent entities
    if (!entity.country_code) throw new Error(`Country code ${entity.country_code} does not exist`);
    const countryCode = entity.country_code;

    const entityType = entity.type;

    if (!allRecentEntities?.[countryCode]) {
      allRecentEntities[countryCode] = {};
    }
    if (!allRecentEntities[countryCode][entityType]) {
      allRecentEntities[countryCode][entityType] = [];
    }

    let recentEntities = [...(allRecentEntities[countryCode][entityType] ?? [])];
    // If the recent entities already contains this value exit early
    if (recentEntities.includes(entityId)) {
      const index = recentEntities.indexOf(entityId);
      const prev = recentEntities.slice(0, index);
      const post = recentEntities.slice(index + 1);

      recentEntities = [entityId, ...prev, ...post];
    } else {
      recentEntities = [entityId, ...recentEntities.splice(0, MAX_RECENT_ENTITIES - 1)];
    }
    allRecentEntities[countryCode][entityType] = recentEntities;
  }

  // Add the latest entity to front of array, cycle out the last entity if we are over the max

  return models.user.updateById(userId, {
    preferences: { ...user.preferences, recent_entities: allRecentEntities },
  });
}
