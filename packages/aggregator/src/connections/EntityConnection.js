/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { ApiConnection } from '@tupaia/server-boilerplate';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_API_URL;

  constructor(session) {
    const { getAuthHeader } = session;
    super({ getAuthHeader });

    session.aggregatorEntityConnectionCache = session.aggregatorEntityConnectionCache || {};
    this.cache = session.aggregatorEntityConnectionCache;
  }

  // functionArguments should receive the 'arguments' object
  getCacheKey = (url, query) => `${url}:${JSON.stringify(query)}`;

  runCachedFetch(url, query) {
    const cacheKey = this.getCacheKey(url, query);
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    this.cache[cacheKey] = this.get(url, query); // may be async, in which case we cache the promise to be awaited
    return this.cache[cacheKey];
  }

  async getDataSourceEntities(
    hierarchyName,
    entityCodes,
    dataSourceEntityType,
    dataSourceEntityFilter = {}, // TODO: Add support for dataSourceEntityFilter https://github.com/beyondessential/tupaia-backlog/issues/2660
  ) {
    return this.runCachedFetch(`hierarchy/${hierarchyName}/relatives`, {
      entities: entityCodes.join(','),
      descendant_filter: `type:${dataSourceEntityType}`,
      field: 'code',
    });
  }

  async getDataSourceEntitiesAndRelationships(
    hierarchyName,
    entityCodes,
    aggregationEntityType,
    dataSourceEntityType,
    dataSourceEntityFilter = {}, // TODO: Add support for dataSourceEntityFilter https://github.com/beyondessential/tupaia-backlog/issues/2660
  ) {
    const query = {
      entities: entityCodes.join(','),
      descendant_filter: `type:${dataSourceEntityType}`,
      field: 'code',
      groupBy: 'descendant',
    };

    // Omitting ancestor_type returns descendants to requested entities map
    if (aggregationEntityType !== 'requested') {
      query.ancestor_filter = `type:${aggregationEntityType}`;
    }

    return this.runCachedFetch(`hierarchy/${hierarchyName}/relationships`, query).then(response => {
      const formattedRelationships = {};
      Object.entries(response).forEach(([descendant, ancestor]) => {
        formattedRelationships[descendant] = { code: ancestor };
      });
      return [Object.keys(formattedRelationships), formattedRelationships];
    });
  }
}
