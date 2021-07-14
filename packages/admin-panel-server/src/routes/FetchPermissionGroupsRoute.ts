/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { FetchMeditrakResourcesRoute } from './FetchMeditrakResourcesRoute';

export class FetchPermissionGroupsRoute extends FetchMeditrakResourcesRoute {
  static endpoint = 'permissionGroups';

  buildColumns() {
    return ['id', 'name'];
  }

  buildFilter() {
    const { search } = this.req.query;
    if (!search) {
      return {};
    }

    return {
      name: {
        comparator: 'ilike',
        comparisonValue: `${search}%`,
        castAs: 'text',
      },
    };
  }
}
