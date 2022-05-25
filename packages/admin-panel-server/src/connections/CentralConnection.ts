/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';

import { AccessPolicy } from '@tupaia/access-policy';
import { QueryParameters, RequestBody, ApiConnection } from '@tupaia/server-boilerplate';

import { BES_ADMIN_PERMISSION_GROUP } from '../constants';

const { CENTRAL_API_URL = 'http://localhost:8090/v2' } = process.env;

const isBESAdmin = (policy: Record<string, string[]>) => {
  return new AccessPolicy(policy).allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
};

const translateParams = (queryParameters?: Record<string, unknown>) => {
  const translatedParams = queryParameters?.filter
    ? { ...queryParameters, filter: JSON.stringify(queryParameters?.filter) }
    : queryParameters;
  return translatedParams as QueryParameters;
};

/**
 * @deprecated use @tupaia/api-client
 */
export class CentralConnection extends ApiConnection {
  public baseUrl = CENTRAL_API_URL;

  public async getUser() {
    const user = await this.get('me');
    return { ...camelcaseKeys(user), isBESAdmin: isBESAdmin(user.accessPolicy) };
  }

  public async fetchResources(endpoint: string, params?: Record<string, unknown>) {
    return this.get(endpoint, translateParams(params));
  }

  public async createResource(
    endpoint: string,
    params: Record<string, unknown>,
    body: RequestBody,
  ) {
    return this.post(endpoint, translateParams(params), body);
  }

  public async updateResource(
    endpoint: string,
    params: Record<string, unknown>,
    body: RequestBody,
  ) {
    return this.put(endpoint, translateParams(params), body);
  }

  public async deleteResource(endpoint: string) {
    return this.delete(endpoint);
  }

  public async upsertResource(
    endpoint: string,
    params: Record<string, unknown>,
    body: RequestBody,
  ) {
    const results = await this.fetchResources(endpoint, params);

    if (results.length > 1) {
      throw new Error(
        `Cannot upsert ${endpoint} since multiple resources were found: please use unique fields in you query`,
      );
    }

    if (results.length === 1) {
      await this.updateResource(`${endpoint}/${results[0].id}`, params, body);
    } else {
      await this.createResource(endpoint, params, body);
    }

    const [resource] = await this.fetchResources(endpoint, params);
    return resource;
  }
}
