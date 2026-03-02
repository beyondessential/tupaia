import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebServerEntityRequest } from '@tupaia/types';
import { NotFoundError } from '@tupaia/utils';

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
    const entity = await models.entity.findOne(
      { code: entityCode },
      { columns: ['id', 'type', 'name', 'code', 'parent_id'] },
    );

    if (!entity) {
      throw new NotFoundError(`No entity exists with code ${entityCode}`);
    }

    const { id, type, name, code, parent_id: parentId } = entity;
    return { id, name, type, code, parentId };
  }
}
