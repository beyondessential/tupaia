/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QueryParameters } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';
import { isLesmisAdmin } from '../utils';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

type RequestBody = Record<string, unknown> | Record<string, unknown>[];

/**
 * @deprecated use @tupaia/api-client
 */
export class MeditrakConnection extends SessionHandlingApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async getUser() {
    // if user is not logged in, return null rather than fetching the api client user details
    if (!this.hasSession) {
      return {};
    }
    const user = await this.get('me');
    return { ...camelcaseKeys(user), isLesmisAdmin: isLesmisAdmin(user.accessPolicy) };
  }

  async getUserEntityPermissions(queryParams: QueryParameters) {
    return this.get('userEntityPermissions', queryParams);
  }

  registerUser(userData: RequestBody) {
    return this.post('user', {}, userData);
  }

  async updateUserEntityPermissions(data: RequestBody) {
    // @ts-ignore
    const { userEntityPermissionId, permissionGroupName } = data;

    // get permission_group byName
    const permissionGroups = await this.get('permissionGroups', {
      filter: JSON.stringify({
        name: permissionGroupName,
      }),
    });

    return this.put(
      `userEntityPermissions/${userEntityPermissionId}`,
      {},
      {
        permission_group_id: permissionGroups[0].id,
      },
    );
  }
}
