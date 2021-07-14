/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { FetchMeditrakResourcesRoute } from './FetchMeditrakResourcesRoute';

enum DataSourceTypes {
  dataElement,
  dataGroup
};

type DataSourceType = keyof typeof DataSourceTypes;

function validateType(type: string): asserts type is DataSourceType {
  if (!type) {
    throw new Error(`Data source type cannot be empty`);
  }

  if (!(type in DataSourceTypes)) {
    throw new Error(`Invalid data source type '${type}', must be one of [${Object.keys(DataSourceTypes).toString()}]`);
  }
}

export class FetchDataSourcesRoute extends FetchMeditrakResourcesRoute {
  static endpoint = 'dataSources';

  buildColumns() {
    return ['id', 'code'];
  }

  buildFilter() {
    const { search, type } = this.req.query;
    validateType(type);

    const searchFilter = search ? {
      code: {
        comparator: 'ilike',
        comparisonValue: `${search}%`,
        castAs: 'text',
      }
    } : {};
    return {
        type: {
          comparisonValue: type,
        },
        ...searchFilter,
      };
  }
}
