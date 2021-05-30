/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QueryParameters } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';
import { LESMIS_COUNTRY_CODE, LESMIS_PERMISSION_GROUP } from '../constants';
import { isLesmisAdmin } from '../utils';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

type RequestBody = Record<string, unknown> | Record<string, unknown>[];

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

  async userEntityPermissions(queryParams: QueryParameters) {
    return this.get('userEntityPermissions', queryParams);
  }

  /*
   *  Attempt to create a new user
   *
   * Successful response should take the form of:
   * {
   *   "userId": "5a0ccc1ee54aa41b031c072b"
   * }
   *
   * Unsuccessful response should take the form of:
   * {
   *   "error": "Existing user found with same email address."
   * }
   * or
   * {
   *   "error": "Please complete fields."
   * }
   */
  registerUser(userData: RequestBody) {
    return this.post(
      'user',
      {},
      {
        countryCode: LESMIS_COUNTRY_CODE,
        permissionGroupName: LESMIS_PERMISSION_GROUP,
        ...userData,
      },
    );
  }
}
