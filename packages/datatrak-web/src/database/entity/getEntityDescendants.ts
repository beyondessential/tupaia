// TODO: Some of these are duplicated from datatrak-web-server with tweaks suitable for datatrak-web,
// Eventually we are going to remove the route from datatrak-web-server
// and use this function only. So keeping it here for now.
import { isNil, omitBy } from 'lodash';

import { AccessPolicy } from '@tupaia/access-policy';
import { EntityRecord, ProjectRecord, extractEntityFilterFromObject } from '@tupaia/tsmodels';
import { camelcaseKeys, ensure, isNotNullish } from '@tupaia/tsutils';
import { Entity, Project } from '@tupaia/types';
import { snakeKeys } from '@tupaia/utils';
import { CurrentUser } from '../../api';
import { DatatrakWebModelRegistry } from '../../types';
import { ExtendedEntityFieldName, formatEntitiesForResponse } from '../../utils';

const DEFAULT_FIELDS: ExtendedEntityFieldName[] = ['id', 'parent_name', 'code', 'name', 'type'];

const DEFAULT_PAGE_SIZE = 100;

interface SearchResult {
  name: string;
  parent?: {
    name: string;
  };
}

export type GetEntityDescendantsParams = {
  filter?: {
    countryCode?: Entity['code'];
    grandparentId?: Entity['id'];
    parentId?: Entity['id'];
    type?: Entity['type'];
  } & Record<string, unknown>;
  fields?: ExtendedEntityFieldName[];
  pageSize?: number;
  searchString?: string;
};

export function sortSearchResults<T extends SearchResult = SearchResult>(
  query: string,
  results: T[],
): T[] {
  const q = query.normalize().toUpperCase();

  return results.sort((a, b) => {
    const aName = a.name.normalize().toUpperCase();
    const bName = b.name.normalize().toUpperCase();

    const aMatchesStrongly = aName.startsWith(q);
    const bMatchesStrongly = bName.startsWith(q);
    if (aMatchesStrongly && bMatchesStrongly) return 0;
    if (aMatchesStrongly && !bMatchesStrongly) return -1;
    if (!aMatchesStrongly && bMatchesStrongly) return 1;

    const aMatchesWeakly =
      aName.includes(q) || a.parent?.name.normalize().toUpperCase().startsWith(q);
    const bMatchesWeakly =
      bName.includes(q) || b.parent?.name.normalize().toUpperCase().startsWith(q);
    if (aMatchesWeakly && !bMatchesWeakly) return -1;
    if (!aMatchesWeakly && bMatchesWeakly) return 1;

    return 0;
  });
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
  const childCodes = countryEntities.map(child => child.country_code).filter(isNotNullish);
  let allowedCountries = [...new Set(childCodes)];

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = await models.project.findOne({
      code: project.code,
    });

    // Fetch all country codes we have any of the project permission groups access to
    const projectAccessibleCountries = new Set<Entity['code']>(
      projectPermissionGroups.flatMap(pg => accessPolicy.getEntitiesAllowed(pg)),
    );
    allowedCountries = allowedCountries.filter(c => projectAccessibleCountries.has(c));
  }

  return allowedCountries;
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
          comparator: '=@',
          comparisonValue: searchString,
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
    filter,
    searchString,
    fields = DEFAULT_FIELDS,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params ?? {};
  const { countryCode, grandparentId, parentId, type } = filter ?? {};

  const entityFilter = buildEntityFilter(params);

  const project = ensure(
    await models.project.findOne({ code: ensure(projectCode) }),
    `No project exists with code ${projectCode}`,
  );

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
    rootEntityId,
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

  const entities: (EntityRecord & { isRecent: true })[] =
    await models.entity.getDescendantsFromParentChildRelation(
      project.entity_hierarchy_id,
      [rootEntityId],
      {
        filter: dbEntityFilter,
        fields,
        pageSize,
      },
    );

  /**
   * @privateRemarks Modifies {@link entities} in-place! This ensures that when the return array is
   * spread into {@link sortedEntities}, they are still {@link EntityRecord} instances and not
   * plain-object shallow clones. This prevents {@link formatEntitiesForResponse} from erroring when
   * it calls methods on objects in {@link sortedEntities}. (As of this commit, using Lodash or
   * es-toolkit’s `clone` would also work; but in this case it’s semantically appropriate for the
   * recent entities hoisted to the top of the array to reference the same instances.)
   */
  const getRecentEntities = async () => {
    const recentEntityIds =
      user.isLoggedIn && // Recent entities irrelevant for public surveys
      user.id && // Redundant (implied by isLoggedIn), for type inference
      countryCode &&
      type
        ? new Set(await models.user.getRecentEntityIds(user.id, countryCode, type))
        : new Set();
    for (const entity of entities) {
      if (recentEntityIds.has(entity.id)) entity.isRecent = true;
    }
    return entities.filter(e => e.isRecent);
  };

  const sortedEntities = searchString
    ? sortSearchResults(searchString, entities)
    : [
        ...(await getRecentEntities()),
        ...entities.sort((a, b) => a.name?.localeCompare(b.name) ?? 0), // SQL projection may exclude `name` attribute
      ];

  const formattedEntities = await formatEntitiesForResponse(
    { hierarchyId: project.entity_hierarchy_id },
    sortedEntities,
    fields,
  );

  return camelcaseKeys(formattedEntities, { deep: true });
};
