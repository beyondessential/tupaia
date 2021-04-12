/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { ApiConnection } from '@tupaia/server-boilerplate';

const { ENTITY_SERVER_API_URL = 'http://localhost:8050/v1' } = process.env;

const buildUrlParam = (key, value, prefix) =>
  prefix ? `${prefix}_${key}:${value}` : `${key}:${value}`;

const convertObjectToUrlParams = (object, prefix) => {
  const paramsArray = [];
  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      paramsArray.push(...convertObjectToUrlParams(value, prefix ? `${prefix}_${key}` : key));
    } else {
      paramsArray.push(buildUrlParam(key, value, prefix));
    }
  });
  return paramsArray;
};

const buildFilter = filter => convertObjectToUrlParams(filter).join(';');

export class EntityConnection extends ApiConnection {
  baseUrl = ENTITY_SERVER_API_URL;

  constructor(session) {
    const { getAuthHeader } = session;
    super({ getAuthHeader });
  }

  async getDataSourceEntities(
    hierarchyName,
    baseEntity,
    dataSourceEntityType,
    dataSourceEntityFilter = {},
  ) {
    const builtFilter = buildFilter(dataSourceEntityFilter);
    return this.get(
      `hierarchy/${hierarchyName}/${baseEntity}/descendants?field=code&descendant_filter=type:${dataSourceEntityType}${
        builtFilter ? `;${builtFilter}` : ''
      }`,
    );
  }

  async getDataSourceEntitiesAndRelations(
    hierarchyName,
    baseEntity,
    aggregationEntityType,
    dataSourceEntityType,
    dataSourceEntityFilter = {},
  ) {
    if (aggregationEntityType === 'requested') {
      const dataSourceEntities = await this.getDataSourceEntities(
        hierarchyName,
        baseEntity,
        dataSourceEntityType,
        dataSourceEntityFilter,
      );
      const formattedRelations = {};
      dataSourceEntities.forEach(descendant => {
        formattedRelations[descendant] = { code: baseEntity };
      });
      return [dataSourceEntities, formattedRelations];
    }

    const builtFilter = buildFilter(dataSourceEntityFilter);
    const url = `hierarchy/${hierarchyName}/${baseEntity}/relations?field=code&groupBy=descendant&ancestor_filter=type:${aggregationEntityType}&descendant_filter=type:${dataSourceEntityType}${
      builtFilter ? `;${builtFilter}` : ''
    }`;
    const response = await this.get(url);
    const formattedRelations = {};
    Object.entries(response).forEach(([descendant, ancestor]) => {
      formattedRelations[descendant] = { code: ancestor };
    });
    return [Object.keys(formattedRelations), formattedRelations];
  }
}
