/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters, ApiConnection } from '@tupaia/server-boilerplate';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

/**
 * @deprecated use @tupaia/api-client
 */
export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async fetchResources(endpoint: string, queryParams: QueryParameters) {
    return this.get(endpoint, queryParams);
  }
}
