/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';

import { AccessPolicy } from '@tupaia/access-policy';
import { QueryParameters, RequestBody, ApiConnection } from '@tupaia/server-boilerplate';

import { BES_ADMIN_PERMISSION_GROUP } from '../constants';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

const isBESAdmin = (policy: Record<string, string[]>) => {
  return new AccessPolicy(policy).allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
};

/**
 * @deprecated use @tupaia/api-client
 */
export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async getUser() {
    const user = await this.get('me');
    return { ...camelcaseKeys(user), isBESAdmin: isBESAdmin(user.accessPolicy) };
  }

  async fetchResources(endpoint: string, rawQueryParams?: Record<string, unknown>) {
    const queryParams = { ...rawQueryParams };
    if (queryParams.filter) {
      queryParams.filter = JSON.stringify(queryParams.filter);
    }
    return this.get(endpoint, queryParams as Record<string, string>);
  }

  async createResource(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.post(endpoint, queryParameters, body);
  }

  async updateResource(endpoint: string, queryParameters: QueryParameters, body: RequestBody) {
    return this.put(endpoint, queryParameters, body);
  }
}
