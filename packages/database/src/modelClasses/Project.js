/**
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('@tupaia/types').Country} Country
 * @typedef {import('@tupaia/types').PermissionGroup} PermissionGroup
 * @typedef {import('@tupaia/types').Project} Project
 * @typedef {import('./Entity').EntityRecord} EntityRecord
 * @typedef {import('./EntityRelation').EntityRelationRecord} EntityRelationRecord
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { SqlQuery } from '../SqlQuery';
import { QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

const TUPAIA_ADMIN_PANEL_PERMISSION_GROUP = 'Tupaia Admin Panel';
const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

export class ProjectRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.PROJECT;

  /**
   * The countries which apply to this project.
   * @returns {Promise<EntityRecord[]>}
   */
  async countries() {
    /** @type {EntityRelationRecord[]} */
    const entityRelations = await this.otherModels.entityRelation.find(
      { parent_id: this.entity_id },
      { columns: ['child_id'] },
    );
    return await Promise.all(
      entityRelations.map(async entityRelation =>
        this.otherModels.entity.findOne({
          id: entityRelation.child_id,
          type: 'country',
        }),
      ),
    );
  }

  async permissionGroups() {
    return this.otherModels.permissionGroup.find({ name: this.permission_groups });
  }

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  async hasAccess(accessPolicy) {
    if (accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP)) return true;
    const entity = await this.entity();
    const projectChildren = await entity.getChildrenViaHierarchy(this.entity_hierarchy_id);

    return projectChildren.some(child =>
      this.permission_groups.some(permissionGroup =>
        accessPolicy.allows(child.country_code, permissionGroup),
      ),
    );
  }

  async hasAdminAccess(accessPolicy) {
    if (accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP)) return true;
    if (!(await this.hasAccess(accessPolicy))) return false;
    const entity = await this.entity();
    const projectChildren = await entity.getChildrenViaHierarchy(this.entity_hierarchy_id);
    return accessPolicy.allowsSome(
      projectChildren.map(c => c.country_code),
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
    );
  }
}

export class ProjectModel extends DatabaseModel {
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
    /** @type {[string, string[] | undefined]} */
    const [whereClause, bindings] = (() => {
      if (!where?.code) return ['', undefined];

      const { code } = where;
      if (typeof code === 'string') return ['WHERE p.code = ?', [code]];

      const { comparator, comparisonValue } = code;
      if (comparator === 'not in' && Array.isArray(comparisonValue) && comparisonValue.length > 0) {
        return [`WHERE p.code NOT IN ${SqlQuery.record(comparisonValue)}`, comparisonValue];
      }

      return ['', undefined];
    })();

    return await this.database.executeSql(
      `
        SELECT
          p.id,
          p.code,
          to_json(sub.child_id) AS entity_ids,
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
          p.config,
          p.entity_hierarchy_id
        FROM
          project p
          LEFT JOIN entity e ON p.entity_id = e.id
          LEFT JOIN (
            SELECT
              parent_id,
              json_agg(child_id) AS child_id
            FROM
              entity_relation er
            GROUP BY
              parent_id) sub ON p.entity_id = sub.parent_id
        ${whereClause};
      `,
      bindings,
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

    return this.find(
      {
        [QUERY_CONJUNCTIONS.RAW]: {
          // Pulls permission_group/country_code pairs from the project
          // Returns any project where we have access to at least one of those pairs
          sql: `(
            SELECT COUNT(*) > 0 FROM
            (
              SELECT UNNEST(project.permission_groups) as permission_group, child_entity.country_code
              FROM entity as child_entity
              INNER JOIN entity_relation
                ON entity_relation.child_id = child_entity.id
                AND entity_relation.parent_id = project.entity_id
                AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
            ) AS count
            WHERE country_code IN
            (
              SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->permission_group)::TEXT)
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
}
