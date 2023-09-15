/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';

export type EntitiesRequest = any;

const DEFAULT_FIELDS = ['id', 'parent_name', 'code', 'name', 'type'];

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { rootEntityCode, projectCode } = params;

    const { type, searchString, page = 0, pageSize = 20, fields = DEFAULT_FIELDS } = query;

    const tempType = typeof Array ? type[0] : type;

    const dbOptions = {
      fields,
      filter: {
        type: tempType,
      },
      pageSize,
      page,
    };

    const entities = searchString
      ? await ctx.services.entity.entitySearch(projectCode, searchString, dbOptions)
      : await ctx.services.entity.getDescendantsOfEntity(projectCode, rootEntityCode, dbOptions);

    return camelcaseKeys(entities, { deep: true });
  }
}
