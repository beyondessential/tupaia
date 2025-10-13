import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUsersRequest } from '@tupaia/types';
import { NotFoundError, ValidationError } from '@tupaia/utils';

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
      throw new ValidationError('Permission group ID is required');
    }

    // get the permission group
    const permissionGroup = await models.permissionGroup.findById(permissionGroupId);

    if (!permissionGroup) {
      throw new NotFoundError(`No permission group exists with ID ${permissionGroupId}`);
    }

    return await models.user.getFilteredUsersForPermissionGroup(countryCode, permissionGroup, searchTerm);
  }
}
