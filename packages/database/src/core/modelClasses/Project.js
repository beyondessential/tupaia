/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('@tupaia/types').Country} Country
 * @typedef {import('@tupaia/types').PermissionGroup} PermissionGroup
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('./Entity').EntityRecord} EntityRecord
 * @typedef {import('./ProjectCountry').ProjectCountryRecord} ProjectCountryRecord
 */

import { SyncDirections } from '@tupaia/constants';
import { EntityTypeEnum } from '@tupaia/types';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { SqlQuery } from '../SqlQuery';
import { RECORDS } from '../records';

const TUPAIA_ADMIN_PANEL_PERMISSION_GROUP = 'Tupaia Admin Panel';
const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

export class ProjectRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.PROJECT;

  /**
   * The countries which apply to this project. TUP-3065: read from the declarative
   * `project_country` join table that replaces the old entity_relation-based lookup.
   * @returns {Promise<EntityRecord[]>}
   */
  async countries() {
    /** @type {ProjectCountryRecord[]} */
    const projectCountries = await this.otherModels.projectCountry.find(
      { project_id: this.id },
      { columns: ['country_id'] },
    );
    if (projectCountries.length === 0) return [];
    return this.otherModels.entity.find({
      id: projectCountries.map(({ country_id }) => country_id),
      type: EntityTypeEnum.country,
    });
  }

  async permissionGroups() {
    return this.otherModels.permissionGroup.find({ name: this.permission_groups });
  }

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  async hasAccess(accessPolicy) {
    if (accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP)) return true;
    // TUP-3065: project's countries come from project_country now. Their `code`
    // doubles as the country_code used by the access policy.
    const countries = await this.countries();
    return countries.some(country =>
      this.permission_groups.some(permissionGroup =>
        accessPolicy.allows(country.code, permissionGroup),
      ),
    );
  }

  async hasAdminAccess(accessPolicy) {
    if (accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP)) return true;
    if (!(await this.hasAccess(accessPolicy))) return false;
    const countries = await this.countries();
    return accessPolicy.allowsSome(
      countries.map(c => c.code),
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    );
  }
}

export class ProjectModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return ProjectRecord;
  }

  /**
   * @param {
   *   | undefined
   *   | { code: Project['code'] }
   *   | { code: { comparator: 'not in'; comparisonValue: Project['code'][] } }
   * } [where]
   */
  async getAllProjectDetails(where) {
    /** @type {Knex.RawBinding} */
    const whereClause = (() => {
      if (!where?.code) return true;

      const { code } = where;
      if (typeof code === 'string') {
        return this.database.connection.raw('p.code = ?', code);
      }

      const { comparator, comparisonValue } = code;
      if (comparator === 'not in' && Array.isArray(comparisonValue) && comparisonValue.length > 0) {
        return this.database.connection.raw(
          `p.code NOT IN ${SqlQuery.record(comparisonValue)}`,
          comparisonValue,
        );
      }

      return true;
    })();

    return await this.database.executeSql(
      `
        SELECT
          p.id,
          p.code,
          to_json(sub.country_id) AS entity_ids,
          e."name",
          e."code" AS entity_code,
          p.description,
          p.sort_order,
          p.permission_groups,
          p.entity_id,
          p.image_url,
          p.logo_url,
          p.dashboard_group_name,
          p.default_measure,
          p.config
        FROM
          project p
          LEFT JOIN entity e ON p.entity_id = e.id
          LEFT JOIN (
            -- TUP-3065: project's entities are now its countries (via project_country),
            -- not all hierarchy descendants. Sub-country entities live under
            -- entity.project_id = p.id and are looked up separately when needed.
            SELECT
              project_id,
              json_agg(country_id) AS country_id
            FROM
              project_country
            GROUP BY
              project_id) sub ON p.id = sub.project_id
        WHERE ?;
      `,
      whereClause,
    );
  }

  /**
   * @param {AccessPolicy} accessPolicy
   * @returns {Promise<ProjectRecord[]>}
   */
  async getAccessibleProjects(accessPolicy) {
    const allPermissionGroups = accessPolicy.getPermissionGroups();
    /** @type {Record<PermissionGroup['name'], Country['code'][]>} */
    const countryCodesByPermissionGroup = {};
    // Generate lists of country codes we have access to per permission group
    allPermissionGroups.forEach(pg => {
      countryCodesByPermissionGroup[pg] = accessPolicy.getEntitiesAllowed(pg);
    });

    return await this.find(
      {
        [QUERY_CONJUNCTIONS.RAW]: {
          // Pulls permission_group/country_code pairs from the project
          // Returns any project where we have access to at least one of those pairs.
          sql: `(
	          EXISTS (
	            SELECT 1
	            FROM (
	              SELECT
								  unnest(project.permission_groups) AS permission_group,
									country_entity.code AS country_code
	              FROM project_country
	              INNER JOIN entity AS country_entity
	                ON country_entity.id = project_country.country_id
	              WHERE project_country.project_id = project.id
	            ) AS permission_group_entity_pairs
	            WHERE country_code IN (
	              SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->permission_group)::TEXT)
	            )
	          )
          )`,
          parameters: [JSON.stringify(countryCodesByPermissionGroup)],
        },
      },
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: ['entity.id', 'project.entity_id'],
      },
    );
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
