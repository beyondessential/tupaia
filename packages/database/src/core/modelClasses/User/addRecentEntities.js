import { ensure } from '@tupaia/tsutils';

const MAX_RECENT_ENTITIES = 3;

/**
 * @param {import('../../ModelRegistry').ModelRegistry} models
 * @param {import('@tupaia/types').User['id']} userId
 * @param {import('@tupaia/types').Entity['id'][]} entityIds
 * @returns {Promise}
 */
export async function addRecentEntities(models, userId, entityIds) {
  if (!entityIds?.length) return;

  const user = ensure(await models.user.findById(userId), `No user exists with ID ${userId}`);

  /**
   * @typedef {import('@tupaia/types').Country["code"]} CountryCode
   * @typedef {import('@tupaia/types').Entity["type"]} EntityType
   * @typedef {import('@tupaia/types').Entity["id"]} EntityId
   * @type {Record<CountryCode, Record<EntityType, EntityId[]>>}
   */
  const recentEntities = user.preferences.recent_entities ?? {};
  for (const entityId of entityIds) {
    /** @type {import('../Entity').EntityRecord} */
    const entity = ensure(
      await models.entity.findById(entityId),
      `No entity exists with ID ${entityId}`,
    );

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
    recentEntities[countryCode] ??= {};
    recentEntities[countryCode][entityType] ??= [];
    recentEntities[countryCode][entityType] = recentEntities[countryCode][entityType]
      .filter(id => id !== entityId) // If already present, remove it so we can bump it to the front
      .slice(0, MAX_RECENT_ENTITIES - 1); // Evict tail

    void recentEntities[countryCode][entityType].unshift(entityId);
  }

  return await models.database.executeSql(
    `
      UPDATE user_account
      SET "preferences" = jsonb_set(preferences, '{recent_entities}', ?, true)
      WHERE id = ?;
    `,
    [JSON.stringify(recentEntities), userId],
  );
}
