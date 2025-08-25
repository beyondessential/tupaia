import { Project } from '@tupaia/types';
import { EntityRecord, ProjectRecord, extractEntityFilterFromObject } from '@tupaia/tsmodels';
import { snakeKeys } from '@tupaia/utils';
import { isNotNullish } from '@tupaia/tsutils';
import { AccessPolicy } from '@tupaia/access-policy';

import { DatatrakWebModelRegistry } from '../../types';
import { DatabaseEffectOptions, ResultObject, useDatabaseEffect } from './useDatabaseEffect';
import {
  EntityResponseObject,
  ExtendedEntityFieldName,
  formatEntitiesForResponse,
} from '../../utils/formatEntity';

const DEFAULT_FIELDS = ['id', 'name', 'code', 'type'] as ExtendedEntityFieldName[];

export type UseProjectEntitiesParams = {
  filter?: Record<string, unknown>;
  fields?: ExtendedEntityFieldName[];
  pageSize?: number;
};

const getAllowedCountries = async (
  models: DatatrakWebModelRegistry,
  project: ProjectRecord,
  isPublic: boolean,
  accessPolicy?: AccessPolicy,
  countryEntities: EntityRecord[] = [],
) => {
  let allowedCountries = countryEntities
    .map(child => child.country_code)
    .filter(isNotNullish)
    .filter((countryCode, index, countryCodes) => countryCodes.indexOf(countryCode) === index); // De-duplicate countryCodes

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = await models.project.findOne({
      code: project.code,
    });

    // Fetch all country codes we have any of the project permission groups access to
    const projectAccessibleCountries: string[] = [];

    for (const permission of projectPermissionGroups) {
      projectAccessibleCountries.push(...(accessPolicy?.getEntitiesAllowed(permission) || []));
    }
    allowedCountries = allowedCountries.filter(countryCode =>
      projectAccessibleCountries.includes(countryCode),
    );
  }

  return allowedCountries;
};

export const useProjectEntities = (
  projectCode?: Project['code'],
  params?: UseProjectEntitiesParams,
  options?: DatabaseEffectOptions,
): ResultObject<EntityResponseObject[]> =>
  useDatabaseEffect(
    async (models, accessPolicy) => {
      if (!projectCode) {
        return [];
      }

      const project = await models.project.findOne({ code: projectCode });
      // Should never happen, but just in case
      if (!project.entity_hierarchy_id || !project.entity_id) {
        throw new Error('Project does not have an entity hierarchy or entity');
      }

      const { filter, fields = DEFAULT_FIELDS, pageSize } = params || {};

      const rootEntity = await models.entity.findById(project.entity_id);
      const countryEntities = await rootEntity.getChildrenFromParentChildRelation(
        project.entity_hierarchy_id,
      );

      const allowedCountries = await getAllowedCountries(
        models,
        project,
        false,
        accessPolicy,
        countryEntities,
      );
      const entityFilter = extractEntityFilterFromObject(allowedCountries, snakeKeys(filter));

      const entities = await models.entity.getDescendantsFromParentChildRelation(
        project.entity_hierarchy_id,
        [project.entity_id],
        {
          filter: entityFilter,
          fields,
          pageSize,
        },
        options,
      );
      return formatEntitiesForResponse(
        { hierarchyId: project.entity_hierarchy_id, allowedCountries },
        entities,
        fields,
      );
    },
    [projectCode, JSON.stringify(options)],
    {
      ...options,
      enabled: !!projectCode && (options?.enabled ?? true),
      placeholderData: [] as EntityRecord[],
    },
  );
