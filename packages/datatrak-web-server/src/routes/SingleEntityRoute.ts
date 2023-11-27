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

export class SingleEntityRoute extends Route<SingleEntityRequest> {
  public async buildResponse() {
    const { params, query, models } = this.req;
    const { entityCode } = params;

    const { id, type, name, code } = await models.entity.findOne(
      { code: entityCode },
      // @ts-ignore - server-boilerplate types don't include columns
      { columns: ['id', 'type', 'code', 'name'] },
    );

    return { id, name, type, code };
  }
}
