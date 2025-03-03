import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebServerEntityRequest, Entity } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';
import { getTypesToExclude } from '../utils';
import { PermissionsError } from '@tupaia/utils';

export type EntityRequest = Request<
  WebServerEntityRequest.Params,
  WebServerEntityRequest.ResBody,
  WebServerEntityRequest.ReqBody,
  WebServerEntityRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntityRoute extends Route<EntityRequest> {
  public async buildResponse() {
    const { params, query, ctx, accessPolicy, models } = this.req;
    const { projectCode, entityCode } = params;

    const typesToExclude = await getTypesToExclude(models, accessPolicy, projectCode);

    const entity = (await ctx.services.entity.getEntity(projectCode, entityCode, {
      fields: DEFAULT_FIELDS,
      ...query,
    })) as Entity;

    if (!entity) {
      throw new Error(`Entity with code ${entityCode} not found.`);
    }

    if (entity.type && typesToExclude.includes(entity.type)) {
      throw new PermissionsError(
        'Access to entity is denied. If you believe this is an error, please contact your system administrator.',
      );
    }

    return camelcaseKeys(entity);
  }
}
