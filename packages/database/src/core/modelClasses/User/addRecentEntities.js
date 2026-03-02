import { ensure } from '@tupaia/tsutils';
import { DatabaseError } from '@tupaia/utils';

const MAX_RECENT_ENTITIES = 3;

/**
 * @param {import('../../ModelRegistry').ModelRegistry} models
 * @param {import('@tupaia/types').User['id']} userId
 * @param {import('@tupaia/types').Entity['id'][]} entityIds
 * @returns {Promise}
 */
export async function addRecentEntities(models, userId, entityIds) {
  if (!entityIds?.length) return;

  /** @type {import('../User').UserRecord} */
  const user = ensure(await models.user.findById(userId), `No user exists with ID ${userId}`);
  if (user.isPublicUser) {
    throw new Error('Usage error: addRecentEntities should not be called with the public user');
  }

  /**
   * @typedef {import('@tupaia/types').Country["code"]} CountryCode
   * @typedef {import('@tupaia/types').Entity["type"]} EntityType
   * @typedef {import('@tupaia/types').Entity["id"]} EntityId
   * @type {Record<CountryCode, Record<EntityType, EntityId[]>>}
   */
  const recentEntityIds = user.preferences.recent_entities ?? {};

  for (const entityId of entityIds) {
    const entity = await models.entity.findById(entityId);
    if (!entity) {
      throw new DatabaseError(`Entity ${entityId} does not exist`);
    }

    if (entity.isProject()) {
      // Projects shouldn’t be added to a user’s recent entities
      throw new Error('addRecentEntities improperly called with a ‘project’-type entity');
    }
    if (!entity.country_code) {
      // This should never happen; only project entities should have NULL country_code
      throw new Error(
        `Unexpected falsy country code for entity ${entity.code}: ${entity.country_code}`,
      );
    }

    const { country_code: countryCode, type: entityType } = entity;
    recentEntityIds[countryCode] ??= {};
    recentEntityIds[countryCode][entityType] ??= [];
    recentEntityIds[countryCode][entityType] = recentEntityIds[countryCode][entityType]
      .filter(id => id !== entityId) // If already present, remove it so we can bump it to the front
      .slice(0, MAX_RECENT_ENTITIES - 1); // Evict tail

    void recentEntityIds[countryCode][entityType].unshift(entityId);
  }

  return await models.database.executeSql(
    `
      UPDATE user_account
      SET "preferences" = jsonb_set(preferences, '{recent_entities}', ?, true)
      WHERE id = ?;
    `,
    [JSON.stringify(recentEntityIds), userId],
  );
}
