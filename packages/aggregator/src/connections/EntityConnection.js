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
  }

  async getDataSourceEntities(
    hierarchyName,
    entityCodes,
    dataSourceEntityType,
    dataSourceEntityFilter = {}, // TODO: Add support for dataSourceEntityFilter https://github.com/beyondessential/tupaia-backlog/issues/2660
  ) {
    return this.get(`hierarchy/${hierarchyName}/relatives`, {
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

    const response = await this.get(`hierarchy/${hierarchyName}/relationships`, query);

    const formattedRelationships = {};
    Object.entries(response).forEach(([descendant, ancestor]) => {
      formattedRelationships[descendant] = { code: ancestor };
    });
    return [Object.keys(formattedRelationships), formattedRelationships];
  }
}
