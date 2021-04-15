/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { ApiConnection } from '@tupaia/server-boilerplate';

const { ENTITY_SERVER_API_URL = 'http://localhost:8050/v1' } = process.env;

const queryParams = (entityCodes, dataSourceEntityType) => ({
  entities: entityCodes.join(','),
  descendant_filter: `type:${dataSourceEntityType}`,
  field: 'code',
  groupBy: 'descendant',
});

export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_SERVER_API_URL;

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
    return this.get(
      `hierarchy/${hierarchyName}/descendants`,
      queryParams(entityCodes, dataSourceEntityType),
    );
  }

  async getDataSourceEntitiesAndRelations(
    hierarchyName,
    entityCodes,
    aggregationEntityType,
    dataSourceEntityType,
    dataSourceEntityFilter = {}, // TODO: Add support for dataSourceEntityFilter https://github.com/beyondessential/tupaia-backlog/issues/2660
  ) {
    const params = queryParams(entityCodes, dataSourceEntityType);

    // Omitting ancestor_type returns descendants to requested entities map
    if (aggregationEntityType !== 'requested') {
      params.ancestor_filter = `type:${aggregationEntityType}`;
    }

    const response = await this.get(`hierarchy/${hierarchyName}/relations`, params);

    const formattedRelations = {};
    Object.entries(response).forEach(([descendant, ancestor]) => {
      formattedRelations[descendant] = { code: ancestor };
    });
    return [Object.keys(formattedRelations), formattedRelations];
  }
}
