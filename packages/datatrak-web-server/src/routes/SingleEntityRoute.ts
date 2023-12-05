/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebServerEntityRequest } from '@tupaia/types';

export type SingleEntityRequest = Request<
  WebServerEntityRequest.Params,
  WebServerEntityRequest.ResBody,
  WebServerEntityRequest.ReqBody,
  WebServerEntityRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['id', 'parent_id', 'code', 'name', 'type'];

export class SingleEntityRoute extends Route<SingleEntityRequest> {
  public async buildResponse() {
    const { params, query, models } = this.req;
    const { entityCode } = params;
    const { fields = DEFAULT_FIELDS, entityId } = query;
    let record;

    if (entityId) {
      // @ts-ignore
      record = await models.entity.findById(entityId, { columns: fields });
    } else {
      // @ts-ignore
      record = await models.entity.findOne({ code: entityCode }, { columns: fields });
    }

    const { id, type, name, code, parent_id: parentId } = record;

    return { id, name, type, code, parentId };
  }
}
