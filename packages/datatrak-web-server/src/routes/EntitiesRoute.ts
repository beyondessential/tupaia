/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';

export type EntitiesRequest = any;

const DEFAULT_FIELDS = ['id', 'parent_name', 'code', 'name', 'type'];

function sortSearchResults(searchString: string, results: any[]) {
  const lowerSearch = searchString.toLowerCase();
  const primarySearchResults = results.filter((entity: any) =>
    entity.name.toLowerCase().startsWith(lowerSearch),
  );
  const secondarySearchResults = results.filter(
    (entity: any) =>
      !entity.name.toLowerCase().startsWith(lowerSearch) &&
      (entity.name.toLowerCase().includes(lowerSearch) ||
        entity.parent?.name.toLowerCase().startsWith(lowerSearch)),
  );

  return [...primarySearchResults, ...secondarySearchResults];
}

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;

    const {
      countryCode,
      projectCode,
      fields = DEFAULT_FIELDS,
      grandparentId,
      parentId,
      searchString,
      type,
    } = query;

    const dbOptions = {
      fields,
      filter: {
        country_code: countryCode,
        type: {
          comparator: '=',
          comparisonValue: type,
        },
        name: {
          comparator: 'ilike',
          comparisonValue: `%${searchString}%`,
        },
      },
    };

    let entityCode = projectCode;

    if (grandparentId || parentId) {
      const response = await ctx.services.central.fetchResources('entities', {
        filter: { id: grandparentId || parentId },
        columns: ['code'],
      });
      const { code } = response[0];
      entityCode = code;
    }

    const entities = await ctx.services.entity.getDescendantsOfEntity(
      projectCode,
      entityCode,
      dbOptions,
    );

    const sortedEntities = sortSearchResults(searchString, entities);

    return camelcaseKeys(sortedEntities, { deep: true });
  }
}
