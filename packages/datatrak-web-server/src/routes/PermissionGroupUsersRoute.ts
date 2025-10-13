import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUsersRequest } from '@tupaia/types';

export interface PermissionGroupUsersRequest
  extends Request<
    DatatrakWebUsersRequest.Params,
    DatatrakWebUsersRequest.ResBody,
    DatatrakWebUsersRequest.ReqBody,
    DatatrakWebUsersRequest.ReqQuery
  > {}

export class PermissionGroupUsersRoute extends Route<PermissionGroupUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { countryCode } = params;

    const { searchTerm, permissionGroupId } = query;

    if (!permissionGroupId) {
      throw new Error('Permission group id is required');
    }

    // get the permission group
    const permissionGroup = await models.permissionGroup.findById(permissionGroupId);

    if (!permissionGroup) {
      throw new Error(`Permission group with id '${permissionGroupId}' not found`);
    }

    return await models.user.getFilteredUsersForPermissionGroup(countryCode, permissionGroup, searchTerm);
  }
}
