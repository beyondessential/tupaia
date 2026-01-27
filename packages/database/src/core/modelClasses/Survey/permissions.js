/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('../../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../PermissionGroup').PermissionGroupModel} PermissionGroupModel
 * @typedef {{
 *   sql: string;
 *   parameters?: readonly Knex.RawBinding[] | Knex.ValueDict | Knex.RawBinding;
 * }} RawClause
 */

import { hasBESAdminAccess } from '@tupaia/access-policy';
import { QUERY_CONJUNCTIONS } from '../../BaseDatabase';
import { SqlQuery } from '../../SqlQuery';

const { AND, RAW } = QUERY_CONJUNCTIONS;

/**
 * @param {Record<string, unknown>} existingCriteria
 * @param {RawClause} rawClause
 */
function attachRawClause(existingCriteria, rawClause) {
  if (existingCriteria[RAW] && existingCriteria[AND]) {
    // Guard to avoid having to recursively check for nested AND clauses
    throw new Error('Couldn’t build database query without overwriting AND clause');
  }

  const augmented = { ...existingCriteria };
  if (augmented[RAW] === undefined) {
    augmented[RAW] = rawClause;
  } else {
    augmented[AND] = { [RAW]: rawClause };
  }

  return augmented;
}

/**
 * @param {ModelRegistry} models
 * @param {AccessPolicy} accessPolicy
 * @param {*} criteria
 */
export async function createSurveyPermissionsFilter(models, accessPolicy, criteria = {}) {
  if (hasBESAdminAccess(accessPolicy)) return criteria;

  const countryIdsByPermissionGroupId =
    await models.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);

  /** @type {RawClause} */
  const clause = {
    sql: `(
      survey.country_ids && ARRAY(
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    )`,
    parameters: JSON.stringify(countryIdsByPermissionGroupId),
  };

  return attachRawClause(criteria, clause);
}

/**
 * @param {ModelRegistry} models
 * @param {AccessPolicy} accessPolicy
 * @param {*} criteria
 * @param {Country['id']} countryId
 */
export async function createSurveyPermissionsViaParentFilter(
  models,
  accessPolicy,
  criteria,
  countryId,
) {
  /** @returns {Promise<RawClause>} */
  async function getClause() {
    if (hasBESAdminAccess(accessPolicy)) {
      // Even for BES Admin, we need to filter by the country
      return {
        sql: '(ARRAY[?] <@ survey.country_ids)',
        parameters: countryId,
      };
    }

    /** @type {ReturnType<PermissionGroupModel['fetchCountryIdsByPermissionGroupId']>} */
    const countryIdsByPgId =
      await models.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);
    const permissionGroupsForCountry = Object.keys(countryIdsByPgId).filter(pgId => {
      const countryIds = countryIdsByPgId[pgId];
      return countryIds.includes(countryId);
    });

    if (permissionGroupsForCountry.length === 0) {
      // Return no results because we don’t have access to any permission groups for this country
      return { sql: 'FALSE' };
    }

    // Choice of survey model is arbitrary; just a way to get to database
    const pgIdsBinding = models.survey.database.connection.raw(
      SqlQuery.record(permissionGroupsForCountry),
      permissionGroupsForCountry,
    );
    return {
      sql: '(ARRAY[?] <@ survey.country_ids AND survey.permission_group_id IN ?)',
      parameters: [countryId, pgIdsBinding],
    };
  }

  return attachRawClause(criteria, await getClause());
}
