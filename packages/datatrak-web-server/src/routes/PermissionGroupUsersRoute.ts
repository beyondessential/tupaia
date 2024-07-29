/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUsersRequest } from '@tupaia/types';
import { getFilteredUsers } from '../utils';

export type PermissionGroupUsersRequest = Request<
  DatatrakWebUsersRequest.Params,
  DatatrakWebUsersRequest.ResBody,
  DatatrakWebUsersRequest.ReqBody,
  DatatrakWebUsersRequest.ReqQuery
>;

export class PermissionGroupUsersRoute extends Route<PermissionGroupUsersRequest> {
  public async buildResponse() {
    const { models, params, query } = this.req;
    const { countryCode } = params;

    const { searchTerm, permissionGroupName } = query;

    // get the permission group
    const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });

    if (!permissionGroup) {
      throw new Error(`Permission group with name ${permissionGroupName} not found`);
    }

    return getFilteredUsers(models, countryCode, permissionGroup, searchTerm);
  }
}
