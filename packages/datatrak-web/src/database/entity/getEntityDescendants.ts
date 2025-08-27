// TODO: Some of these are duplicated from datatrak-web-server with tweaks suitable for datatrak-web,
// Eventually we are going to remove the route from datatrak-web-server
// and use this function only. So keeping it here for now.
import { isNil, omitBy } from 'lodash';

import { camelcaseKeys, isNotNullish } from '@tupaia/tsutils';
import { AccessPolicy } from '@tupaia/access-policy';
import { EntityRecord, ProjectRecord, extractEntityFilterFromObject } from '@tupaia/tsmodels';
import { snakeKeys } from '@tupaia/utils';

import { CurrentUser } from '../../api';
import { ExtendedEntityFieldName, formatEntitiesForResponse } from '../../utils';
import { DatatrakWebModelRegistry } from '../../types';
import { Project } from '@tupaia/types';

const DEFAULT_FIELDS = ['id', 'parent_name', 'code', 'name', 'type'] as ExtendedEntityFieldName[];

const DEFAULT_PAGE_SIZE = 100;

type SearchResult = {
  name: string;
  parent?: {
    name: string;
  };
};

export type GetEntityDescendantsParams = {
  filter?: Record<string, unknown>;
  fields?: ExtendedEntityFieldName[];
  pageSize?: number;
  searchString?: string;
};

export function sortSearchResults(searchString: string, results: SearchResult[]) {
  const lowerSearch = searchString.toLowerCase();

  const primarySearchResults = results.filter(({ name }) =>
    name.toLowerCase().startsWith(lowerSearch),
  );

  const secondarySearchResults = results.filter(
    ({ name, parent }) =>
      !name.toLowerCase().startsWith(lowerSearch) &&
      (name.toLowerCase().includes(lowerSearch) ||
        parent?.name.toLowerCase().startsWith(lowerSearch)),
  );

  return [...primarySearchResults, ...secondarySearchResults];
}

const getAllowedCountries = async (
  models: DatatrakWebModelRegistry,
  rootEntityId: string,
  project: ProjectRecord,
  isPublic: boolean,
  accessPolicy: AccessPolicy,
) => {
  const rootEntity = await models.entity.findById(rootEntityId);

  if (!project.entity_hierarchy_id) {
    throw new Error('Project entity hierarchy ID is not set');
  }

  const countryEntities = await rootEntity.getChildrenFromParentChildRelation(
    project.entity_hierarchy_id,
  );

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
      projectAccessibleCountries.push(...(accessPolicy.getEntitiesAllowed(permission) || []));
    }
    allowedCountries = allowedCountries.filter(countryCode =>
      projectAccessibleCountries.includes(countryCode),
    );
  }

  return allowedCountries;
};

const getRecentEntities = async (
  models: DatatrakWebModelRegistry,
  user: CurrentUser,
  countryCode: string,
  type: string,
  entities: EntityRecord[],
) => {
  // For public surveys
  if (user.isLoggedIn) {
    const recentEntities = await models.user.getRecentEntities(
      user.id,
      countryCode as string,
      type as string,
    );
    return recentEntities
      .map((id: string) => {
        const entity = entities.find((e: EntityRecord) => e.id === id);
        if (!entity) return null;
        return { ...entity, isRecent: true };
      })
      .filter(Boolean);
  }

  return [];
};

const buildEntityFilter = (params: GetEntityDescendantsParams) => {
  const { filter, searchString } = params;

  if (!filter) {
    return null;
  }

  const { countryCode, type, parentId, grandparentId, ...restOfFilter } = filter;

  const entityFilter = {
    country_code: countryCode,
    type,
    name: searchString
      ? {
          comparator: 'ilike',
          comparisonValue: `%${searchString}%`,
        }
      : undefined,
    ...restOfFilter,
  };

  return omitBy(snakeKeys(entityFilter), isNil);
};

export const getEntityDescendants = async ({
  models,
  projectCode,
  params = {},
  user,
  accessPolicy,
}: {
  models: DatatrakWebModelRegistry;
  projectCode?: Project['code'];
  params?: GetEntityDescendantsParams;
  user: CurrentUser;
  accessPolicy: AccessPolicy;
}) => {
  const {
    filter: { countryCode, grandparentId, parentId, type } = {},
    searchString,
    fields = DEFAULT_FIELDS,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params || {};

  const entityFilter = buildEntityFilter(params);

  const project = await models.project.findOne({ code: projectCode });

  // This should never happen, but just in case
  if (!project.entity_hierarchy_id) {
    throw new Error('Project entity hierarchy ID is not set');
  }

  const rootEntityId = parentId || grandparentId || project.entity_id;
  if (!rootEntityId) {
    throw new Error('No valid rootEntity found');
  }

  const allowedCountries = await getAllowedCountries(
    models,
    rootEntityId as string,
    project,
    false,
    accessPolicy,
  );

  const dbEntityFilter = extractEntityFilterFromObject(allowedCountries, entityFilter);

  if (parentId) {
    // If parentId is provided, we just want to get the children of that entity
    dbEntityFilter.generational_distance = 1;
  } else if (grandparentId) {
    // If grandparentId is provided, we just want to get the grandchildren of that entity
    dbEntityFilter.generational_distance = 2;
  }

  const entities = await models.entity.getDescendantsFromParentChildRelation(
    project.entity_hierarchy_id,
    [rootEntityId],
    {
      filter: dbEntityFilter,
      fields,
      pageSize,
    },
  );

  const recentEntities = await getRecentEntities(
    models,
    user,
    countryCode as string,
    type as string,
    entities,
  );

  const sortedEntities = searchString
    ? sortSearchResults(searchString, entities)
    : [
        ...recentEntities,
        ...entities.sort((a: EntityRecord, b: EntityRecord) => a.name?.localeCompare(b.name) ?? 0), // SQL projection may exclude `name` attribute
      ];

  const formattedEntities = await formatEntitiesForResponse(
    { hierarchyId: project.entity_hierarchy_id },
    sortedEntities,
    fields,
  );

  return camelcaseKeys(formattedEntities, { deep: true });
};
