import { SyncDirections } from '@tupaia/constants';
import { EntityTypeEnum } from '@tupaia/types';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const TUPAIA_ADMIN_PANEL_PERMISSION_GROUP = 'Tupaia Admin Panel';
const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';
export class ProjectRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.PROJECT;

  /**
   * The countries which apply to this project.
   */
  async countries() {
    const entityRelations = await this.otherModels.entityRelation.find({
      parent_id: this.entity_id,
    });
    return Promise.all(
      entityRelations.map(async entityRelation =>
        this.otherModels.entity.findOne({
          id: entityRelation.child_id,
          type: EntityTypeEnum.country,
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
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return ProjectRecord;
  }

  async getAllProjectDetails() {
    return this.database.executeSql(`
      select p.id, p.code,
            to_json(sub.child_id) AS entity_ids,
            e."name", e."code" as entity_code, p.description,
            p.sort_order, p.permission_groups,
            p.entity_id, p.image_url,
            p.logo_url, p.dashboard_group_name,
            p.default_measure, p.config, p.entity_hierarchy_id
      from project p
        left join entity e
          on p.entity_id = e.id
        left join (select parent_id, json_agg(child_id) as child_id from entity_relation er group by parent_id) sub
          on p.entity_id = sub.parent_id
    `);
  }

  async getAccessibleProjects(accessPolicy) {
    const allPermissionGroups = accessPolicy.getPermissionGroups();
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
        joinWith: 'entity',
        joinCondition: ['entity.id', 'project.entity_id'],
      },
    );
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
