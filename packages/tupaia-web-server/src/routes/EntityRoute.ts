/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelCaseKeys from 'camelcase-keys';

// TODO: WAITP-1278 Move this to types
export type EntityRequest = Request<any, any, any, any>;

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntityRoute extends Route<EntityRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { projectCode, entityCode } = params;

    const entity = await ctx.services.entity.getEntity(projectCode, entityCode, {
      fields: DEFAULT_FIELDS,
      ...query,
    });

    return camelCaseKeys(entity);
  }
}
