/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';
import { LESMIS_COUNTRY_CODE, LESMIS_PERMISSION_GROUP } from '../constants';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

type RequestBody = Record<string, unknown> | Record<string, unknown>[];

const FIELDS = {
  user_id: 'id',
  'user.first_name': 'firstName',
  'user.last_name': 'lastName',
  'user.email': 'email',
  'user.mobile_number': 'mobileNumber',
  'user.employer': 'employer',
  'user.position': 'position',
  'entity.name': 'entityName',
  'entity.code': 'entityCode',
  'permission_group.name': 'permissionGroupName',
};

export class MeditrakConnection extends SessionHandlingApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async getUser() {
    // if user is not logged in, return null rather than fetching the api client user details
    if (!this.hasSession) {
      return {};
    }
    const user = await this.get('me');
    return camelcaseKeys(user);
  }

  async getUsers() {
    const response = await this.get('userEntityPermissions', {
      pageSize: 10000,
      columns: JSON.stringify(Object.keys(FIELDS)),
      filter: JSON.stringify({
        'entity.name': { comparator: 'like', comparisonValue: 'Laos', castAs: 'text' },
        // 'permission_group.name.name': {
        //   comparator: 'like',
        //   comparisonValue: 'LESMIS Public',
        //   castAs: 'text',
        // },
      }),
    });

    const users = response.map(user => {
      const obj = {};
      const keys = Object.keys(user);
      keys.forEach(key => {
        const newKey = FIELDS[key];
        obj[newKey] = user[key];
      });
      return obj;
    });

    return users;
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
