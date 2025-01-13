import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebServerEntityRequest } from '@tupaia/types';

export type SingleEntityRequest = Request<
  WebServerEntityRequest.Params,
  WebServerEntityRequest.ResBody,
  WebServerEntityRequest.ReqBody,
  WebServerEntityRequest.ReqQuery
>;

export class SingleEntityRoute extends Route<SingleEntityRequest> {
  public async buildResponse() {
    const { params, models } = this.req;
    const { entityCode } = params;
    const {
      id,
      type,
      name,
      code,
      parent_id: parentId,
    } = await models.entity.findOne({ code: entityCode });
    return { id, name, type, code, parentId };
  }
}
