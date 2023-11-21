/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { Entity, WebServerEntityRequest } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';

export type SingleEntityRequest = Request<
  WebServerEntityRequest.Params,
  WebServerEntityRequest.ResBody,
  WebServerEntityRequest.ReqBody,
  WebServerEntityRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['id', 'parent_code', 'code', 'name', 'type'];

export class SingleEntityRoute extends Route<SingleEntityRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { projectCode, entityCode } = params;

    const entity = (await ctx.services.entity.getEntity(projectCode, entityCode, {
      fields: DEFAULT_FIELDS,
      ...query,
    })) as Entity;

    return camelcaseKeys(entity);
  }
}
