/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { ApiConnection } from '@tupaia/server-boilerplate';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

const CLAUSE_DELIMITER = ';';
const FIELD_VALUE_DELIMITER = ':';
const NESTED_FIELD_DELIMITER = '_';
const MULTIPLE_VALUES_DELIMITER = ',';

const recurseFilter = (filter, filterArray = [], key = '') => {
  if (Array.isArray(filter)) {
    const flatValue = filter.join(MULTIPLE_VALUES_DELIMITER); // Assume all array items are string-able
    filterArray.push([key, flatValue]);
    return filter;
  }

  if (typeof filter === 'object') {
    Object.entries(filter).forEach(([subKey, value]) =>
      recurseFilter(
        value,
        filterArray,
        `${key}${key.length > 0 ? NESTED_FIELD_DELIMITER : ''}${subKey}`,
      ),
    );
    return filterArray;
  }

  filterArray.push([key, filter]);
  return filterArray;
};

const constructFilterParam = filter =>
  recurseFilter(filter)
    .map(([key, value]) => `${key}${FIELD_VALUE_DELIMITER}${value}`)
    .join(CLAUSE_DELIMITER);

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
    dataSourceEntityFilter,
  ) {
    return this.get(`hierarchy/${hierarchyName}/descendants`, {
      entities: entityCodes.join(','),
      descendant_filter: constructFilterParam({
        ...dataSourceEntityFilter,
        type: dataSourceEntityType,
      }),
      field: 'code',
    });
  }

  async getDataSourceEntitiesAndRelations(
    hierarchyName,
    entityCodes,
    aggregationEntityType,
    dataSourceEntityType,
    dataSourceEntityFilter,
  ) {
    const query = {
      entities: entityCodes.join(','),
      descendant_filter: constructFilterParam({
        ...dataSourceEntityFilter,
        type: dataSourceEntityType,
      }),
      field: 'code',
      groupBy: 'descendant',
    };

    // Omitting ancestor_type returns descendants to requested entities map
    if (aggregationEntityType !== 'requested') {
      query.ancestor_filter = constructFilterParam({ type: aggregationEntityType });
    }

    const response = await this.get(`hierarchy/${hierarchyName}/relations`, query);

    const formattedRelations = {};
    Object.entries(response).forEach(([descendant, ancestor]) => {
      formattedRelations[descendant] = { code: ancestor };
    });
    return [Object.keys(formattedRelations), formattedRelations];
  }
}
