/**
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('../../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../PermissionGroup').PermissionGroupModel} PermissionGroupModel
 */

import { hasBESAdminAccess } from '@tupaia/access-policy';
import { QUERY_CONJUNCTIONS } from '../../BaseDatabase';
import { SqlQuery } from '../../SqlQuery';

const { RAW } = QUERY_CONJUNCTIONS;

/**
 * @param {ModelRegistry} models
 * @param {AccessPolicy} accessPolicy
 * @param {*} criteria
 * @param {Country['id']} countryId
 * @returns {*} A shallow copy of `criteria`, augmented with an additional clause to filter by the
 * permission groups `accessPolicy` permis access to in the country specified by `countryId`.
 */
export async function createSurveyPermissionsViaParentFilter(
  models,
  accessPolicy,
  criteria,
  countryId,
) {
  const dbConditions = { ...criteria };

  if (hasBESAdminAccess(accessPolicy)) {
    // Even for BES Admin, we need to filter by the country
    dbConditions[RAW] = {
      sql: '(ARRAY[?] <@ survey.country_ids)',
      parameters: countryId,
    };
    return dbConditions;
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
    dbConditions[RAW] = { sql: 'FALSE' };
    return dbConditions;
  }

  // Choice of survey model is arbitrary; just a way to get to database
  const pgIdsBinding = models.survey.database.connection.raw(
    SqlQuery.record(permissionGroupsForCountry),
    permissionGroupsForCountry,
  );
  dbConditions[RAW] = {
    sql: '(ARRAY[?] <@ survey.country_ids AND survey.permission_group_id IN ?)',
    parameters: [countryId, pgIdsBinding],
  };
  return dbConditions;
}
