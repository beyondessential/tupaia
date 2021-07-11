/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '@tupaia/server-boilerplate';

import { NonSessionApiConnection } from './NonSessionApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

export class MeditrakConnection extends NonSessionApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async fetchResources(endpoint: string, queryParams: QueryParameters) {
    return this.get(endpoint, queryParams);
  }
}
