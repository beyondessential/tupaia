/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { GETHandler } from './GETHandler';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../permissions';
import { hasAccessToEntityForVisualisation } from './utilities';

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
  permissionsFilteredInternally = true;

  customJoinConditions = {
    entity: ['entity.id', 'project.entity_id'],
    entity_hierarchy: ['entity_hierarchy.id', 'project.entity_hierarchy_id'],
  };

  countriesFieldKey = 'countries';

  async findSingleRecord(projectId, options) {
    const projectPermissionChecker = accessPolicy =>
      assertProjectPermissions(accessPolicy, this.models, projectId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, projectPermissionChecker]),
    );

    const countryNameKey = options.columns.find(x => Object.keys(x)[0] === this.countriesFieldKey);
    if (!countryNameKey) {
      return super.findSingleRecord(projectId, options);
    }

    const columns = options.columns.filter(x => Object.keys(x)[0] !== this.countriesFieldKey);
    const dbOptions = { ...options, columns: [...columns, { id: 'project.id' }] };
    const countriesById = await this.getProjectCountriesByProjectId();
    const project = await super.findSingleRecord(projectId, dbOptions);
    return { ...project, countries: countriesById[project.id].countryNames };
  }

  async findRecords(criteria, options) {
    const { recordId } = this;
    const projectPermissionChecker = accessPolicy =>
      assertProjectPermissions(accessPolicy, this.models, recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, projectPermissionChecker]),
    );

    const countryNameKey = options.columns.find(x => Object.keys(x)[0] === this.countriesFieldKey);
    if (!countryNameKey) {
      return super.findRecords(criteria, options);
    }

    const columns = options.columns.filter(x => Object.keys(x)[0] !== this.countriesFieldKey);
    const dbOptions = { ...options, columns };
    const projects = await this.database.find(this.recordType, criteria, dbOptions);

    const countriesById = await this.getProjectCountriesByProjectId();
    return projects.map(project => {
      return {
        ...project,
        countries: countriesById[project.id].countryNames,
      };
    });
  }

  async getProjectCountriesByProjectId() {
    const countries = await this.database.executeSql(
      `SELECT p.id as "projectId", ARRAY_AGG(child_entity.name) as "countryNames" FROM entity e
        JOIN project p ON p.entity_id = e.id
        JOIN entity_relation er ON er.entity_hierarchy_id = p.entity_hierarchy_id AND er.parent_id = e.id
        JOIN entity child_entity ON child_entity.id = er.child_id
       WHERE child_entity.type = 'country' GROUP BY p.id;`,
    );
    return keyBy(countries, 'projectId');
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
