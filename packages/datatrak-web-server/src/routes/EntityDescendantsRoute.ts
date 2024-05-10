/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebEntityDescendantsRequest, EntityType, UserAccount } from '@tupaia/types';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { sortSearchResults } from '../utils';

export type EntityDescendantsRequest = Request<
  DatatrakWebEntityDescendantsRequest.Params,
  DatatrakWebEntityDescendantsRequest.ResBody,
  DatatrakWebEntityDescendantsRequest.ReqBody,
  DatatrakWebEntityDescendantsRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['id', 'parent_name', 'code', 'name', 'type'];

async function getEntityCodeFromId(services: TupaiaApiClient, id: string) {
  const response = await services.central.fetchResources('entities', {
    filter: { id },
    columns: ['code'],
  });
  const { code } = response[0];
  return code;
}

const getRecentEntities = (
  currentUser: UserAccount,
  countryCode: string | undefined,
  type: string | undefined,
) => {
  const { recent_entities: userRecentEntities } = currentUser.preferences;
  if (!userRecentEntities || !countryCode || !type) {
    return [];
  }

  const recentEntitiesForCountry = userRecentEntities[countryCode];
  if (!recentEntitiesForCountry) {
    return [];
  }

  const entityTypes = type.split(',');
  const recentEntitiesOfTypes = entityTypes
    .map(entityType => userRecentEntities[countryCode][entityType as EntityType] ?? [])
    .flat();

  return recentEntitiesOfTypes;
};

export class EntityDescendantsRoute extends Route<EntityDescendantsRequest> {
  public async buildResponse() {
    const { query, ctx, session, models } = this.req;
    const { services } = ctx;
    const isLoggedIn = !!session;

    let recentEntities: string[] = [];

    const {
      filter: { countryCode, projectCode, grandparentId, parentId, type, ...restOfFilter },
      searchString,
      fields = DEFAULT_FIELDS,
    } = query;

    if (isLoggedIn) {
      const currentUser = await models.user.findOne({ email: session.email });

      recentEntities = getRecentEntities(currentUser, countryCode, type);
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
      entityCode = await getEntityCodeFromId(services, parentId);
      filter.generational_distance = {
        comparator: '=',
        comparisonValue: 1,
      };
    } else if (grandparentId) {
      // If grandparentId is provided, we just want to get the grandchildren of that entity
      entityCode = await getEntityCodeFromId(services, grandparentId);
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
              if (!entity) return null; // If the entity is not found, return null so it is filtered out. This can happen if the entity has been deleted or if the entity is new and the entity hierarchy cache has not refreshed yet
              return {
                ...entity,
                isRecent: true,
              };
            })
            .filter(e => e),
          ...entities,
        ];

    return camelcaseKeys(sortedEntities, { deep: true });
  }
}
