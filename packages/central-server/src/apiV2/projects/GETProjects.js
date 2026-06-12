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
  const rootEntity = await project.getRootEntity();
  for (let i = 0; i < project.permission_groups.length; ++i) {
    if (
      await hasAccessToEntityForVisualisation(
        accessPolicy,
        models,
        rootEntity,
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

  // `countries` and `countryCodes` are virtual columns attached post-query by
  // attachCountries, not real project columns — strip them from the SQL select
  // so a request for them doesn't try to select project.countryCodes.
  async getProcessedColumns() {
    const columns = await super.getProcessedColumns();
    return columns.filter(spec => !('countries' in spec) && !('countryCodes' in spec));
  }

  async findSingleRecord(projectId, options) {
    const projectPermissionChecker = accessPolicy =>
      assertProjectPermissions(accessPolicy, this.models, projectId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, projectPermissionChecker]),
    );

    const record = await super.findSingleRecord(projectId, options);
    if (!record) return record;
    // Key off the known projectId, not record.id — the single-record fetch
    // doesn't request the id column, so record.id is usually absent.
    const byProject = await this.fetchCountriesByProject([projectId]);
    const { countries = [], countryCodes = [] } = byProject.get(projectId) ?? {};
    return { ...record, countries, countryCodes };
  }

  async findRecords(criteria, options) {
    const records = await super.findRecords(criteria, options);
    const projectIds = records.map(record => record?.id).filter(Boolean);
    const byProject = await this.fetchCountriesByProject(projectIds);
    return records.map(record => {
      if (!record) return record;
      const { countries = [], countryCodes = [] } = byProject.get(record.id) ?? {};
      return { ...record, countries, countryCodes };
    });
  }

  // Map each project id to its countries: `countries` is the array of `country`
  // table ids the edit form's checkbox list pre-fills and submits (matching the
  // create field's optionValueKey); `countryCodes` is the human-readable list
  // display. project_country stores country *entity* ids, so map back to the
  // country table via the shared entity code.
  async fetchCountriesByProject(projectIds) {
    const byProject = new Map();
    if (projectIds.length === 0) return byProject;

    const rows = await this.database.executeSql(
      `
        SELECT pc.project_id, c.id AS country_id, c.code AS country_code
        FROM project_country pc
        JOIN entity e ON e.id = pc.country_id
        JOIN country c ON c.code = e.code
        WHERE pc.project_id IN (${projectIds.map(() => '?').join(', ')})
        ORDER BY c.code ASC;
      `,
      projectIds,
    );

    for (const { project_id: projectId, country_id: countryId, country_code: code } of rows) {
      if (!byProject.has(projectId)) byProject.set(projectId, { countries: [], countryCodes: [] });
      byProject.get(projectId).countries.push(countryId);
      byProject.get(projectId).countryCodes.push(code);
    }

    return byProject;
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
      // Returns any project where we have access to at least one of those pairs.
      dbConditions[RAW] = {
        sql: `(
          SELECT COUNT(*) > 0 FROM
          (
            SELECT UNNEST(project.permission_groups) as permission_group, entity.code AS country_code
            FROM project_country
            INNER JOIN entity
              ON entity.id = project_country.country_id
            WHERE project_country.project_id = project.id
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
