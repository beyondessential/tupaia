/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { ApiConnection } from '@tupaia/server-boilerplate';

const { ENTITY_SERVER_API_URL = 'http://localhost:8050/v1' } = process.env;

const createDescendantsUrl = (hierarchyName, entityCodes, dataSourceEntityType) =>
  `hierarchy/${hierarchyName}/descendants?entities=${entityCodes.join(
    ',',
  )}&field=code&descendant_filter=type:${dataSourceEntityType}`;

const createRelationsUrl = (
  hierarchyName,
  entityCodes,
  aggregationEntityType,
  dataSourceEntityType,
) =>
  `hierarchy/${hierarchyName}/relations?entities=${entityCodes.join(
    ',',
  )}&field=code&groupBy=descendant&${
    aggregationEntityType === 'requested' ? '' : `ancestor_filter=type:${aggregationEntityType}`
  }&descendant_filter=type:${dataSourceEntityType}`;

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
    return this.get(createDescendantsUrl(hierarchyName, entityCodes, dataSourceEntityType));
  }

  async getDataSourceEntitiesAndRelations(
    hierarchyName,
    entityCodes,
    aggregationEntityType,
    dataSourceEntityType,
    dataSourceEntityFilter = {}, // TODO: Add support for dataSourceEntityFilter https://github.com/beyondessential/tupaia-backlog/issues/2660
  ) {
    const response = await this.get(
      createRelationsUrl(hierarchyName, entityCodes, aggregationEntityType, dataSourceEntityType),
    );
    const formattedRelations = {};
    Object.entries(response).forEach(([descendant, ancestor]) => {
      formattedRelations[descendant] = { code: ancestor };
    });
    return [Object.keys(formattedRelations), formattedRelations];
  }
}
