import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { ensure, isNotNullish } from '@tupaia/tsutils';
import { DatatrakWebEntityDescendantsRequest, Entity } from '@tupaia/types';

import { DatatrakWebServerModelRegistry } from '../types';
import { sortSearchResults } from '../utils';

export type EntityDescendantsRequest = Request<
  DatatrakWebEntityDescendantsRequest.Params,
  DatatrakWebEntityDescendantsRequest.ResBody,
  DatatrakWebEntityDescendantsRequest.ReqBody,
  DatatrakWebEntityDescendantsRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['id', 'parent_name', 'code', 'name', 'type'];

const DEFAULT_PAGE_SIZE = 100;

// Resolve directly against the DB, not central's entities list endpoint: that
// endpoint scopes non-BES-admin users to their Tupaia Admin Panel countries,
// which a DataTrak data-entry user doesn't have — so it returned nothing and the
// parent/grandparent filter 500'd. The id uniquely identifies the project's row.
async function getEntityCodeFromId(models: DatatrakWebServerModelRegistry, id: string) {
  const entity = ensure(await models.entity.findById(id), `No entity found with id ${id}`);
  return entity.code;
}

export class EntityDescendantsRoute extends Route<EntityDescendantsRequest> {
  public async buildResponse() {
    const { query, ctx, session, models } = this.req;
    const { services } = ctx;
    const isLoggedIn = !!session;

    let recentEntities: Entity['id'][] = [];

    const {
      filter: { countryCode, projectCode, grandparentId, parentId, type, ...restOfFilter },
      searchString,
      fields = DEFAULT_FIELDS,
      pageSize = DEFAULT_PAGE_SIZE,
    } = query;

    if (isLoggedIn) {
      const currentUser = ensure(
        await models.user.findOne({ email: session.email }),
        `No user exists with email ${session.email}`,
      );
      recentEntities = currentUser.getRecentEntityIds(countryCode, type);
    }

    const filter = {
      generational_distance: {},
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

    let entityCode = projectCode as string;

    if (parentId) {
      // If parentId is provided, we just want to get the children of that entity
      entityCode = await getEntityCodeFromId(models, parentId);
      filter.generational_distance = {
        comparator: '=',
        comparisonValue: 1,
      };
    } else if (grandparentId) {
      // If grandparentId is provided, we just want to get the grandchildren of that entity
      entityCode = await getEntityCodeFromId(models, grandparentId);
      filter.generational_distance = {
        comparator: '=',
        comparisonValue: 2,
      };
    }

    const entities = await services.entity.getDescendantsOfEntity(
      projectCode,
      entityCode,
      {
        fields,
        filter,
        pageSize,
      },
      false,
      !isLoggedIn,
    );

    const sortedEntities = searchString
      ? sortSearchResults(searchString, entities)
      : [
          ...recentEntities
            .map((id: string) => {
              const entity = entities.find((e: any) => e.id === id);
              if (!entity) {
                // This can happen if the entity has been deleted; or it’s new and the entity
                // hierarchy cache hasn’t refreshed yet
                return null;
              }
              return { ...entity, isRecent: true };
            })
            .filter(isNotNullish),
          ...entities.sort((a: any, b: any) => a.name?.localeCompare(b.name) ?? 0), // SQL projection may exclude `name` attribute
        ];

    return camelcaseKeys(sortedEntities, { deep: true });
  }
}
