/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { sortSearchResults } from '../utils';

export type EntitiesRequest = Request<
  DatatrakWebEntitiesRequest.Params,
  DatatrakWebEntitiesRequest.ResBody,
  DatatrakWebEntitiesRequest.ReqBody,
  DatatrakWebEntitiesRequest.ReqQuery
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

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { query, ctx, session } = this.req;
    const { services } = ctx;
    const isLoggedIn = !!session;

    const {
      filter: { countryCode, projectCode, grandparentId, parentId, searchString, type },
      fields = DEFAULT_FIELDS,
    } = query;

    const filter = {
      generational_distance: {},
      country_code: countryCode,
      type: {
        comparator: '=',
        comparisonValue: type,
      },
      name: searchString
        ? {
            comparator: 'ilike',
            comparisonValue: `%${searchString}%`,
          }
        : undefined,
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
      !isLoggedIn,
    );

    const sortedEntities = searchString
      ? (sortSearchResults(searchString, entities) as DatatrakWebEntitiesRequest.ResBody)
      : entities;

    return camelcaseKeys(sortedEntities, { deep: true });
  }
}
