import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { hasAccessToEntityForVisualisation } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertProjectPermissions = async (accessPolicy, models, projectId) => {
  const project = await models.project.findById(projectId);
  if (!project) {
    throw new Error(`No project exists with id ${projectId}`);
  }
  const entity = await models.entity.findById(project.entity_id);
  for (let i = 0; i < project.permission_groups.length; ++i) {
    if (
      await hasAccessToEntityForVisualisation(
        accessPolicy,
        models,
        entity,
        project.permission_groups[i],
      )
    ) {
      return true;
    }
  }
  throw new Error('Requires access to one of the countries for this project');
};

export class GETProjects extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  customJoinConditions = {
    entity: {
      nearTableKey: 'project.entity_id',
      farTableKey: 'entity.id',
    },
    entity_hierarchy: {
      nearTableKey: 'project.entity_hierarchy_id',
      farTableKey: 'entity_hierarchy.id',
    },
  };

  async findSingleRecord(projectId, options) {
    const projectPermissionChecker = accessPolicy =>
      assertProjectPermissions(accessPolicy, this.models, projectId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, projectPermissionChecker]),
    );

    return super.findSingleRecord(projectId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };
    if (!hasBESAdminAccess(this.accessPolicy)) {
      const allPermissionGroups = this.accessPolicy.getPermissionGroups();
      const countryCodesByPermissionGroup = {};

      // Generate lists of country codes we have access to per permission group
      allPermissionGroups.forEach(pg => {
        countryCodesByPermissionGroup[pg] = this.accessPolicy.getEntitiesAllowed(pg);
      });

      // Pulls permission_group/country_code pairs from the project
      // Returns any project where we have access to at least one of those pairs
      dbConditions[RAW] = {
        sql: `(
          SELECT COUNT(*) > 0 FROM
          (
            SELECT UNNEST(project.permission_groups) as permission_group, entity.country_code
            FROM entity
            INNER JOIN entity_relation
              ON entity_relation.child_id = entity.id
              AND entity_relation.parent_id = project.entity_id
              AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
          ) AS count
          WHERE country_code IN
          (
            SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->permission_group)::TEXT)
          )
        )`,
        parameters: [JSON.stringify(countryCodesByPermissionGroup)],
      };
    }

    return { dbConditions, dbOptions: options };
  }
}
