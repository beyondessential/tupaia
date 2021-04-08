/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from '@tupaia/server-boilerplate';
const { WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1' } = process.env;

export class WebConfigConnection extends ApiConnection {
  baseUrl = WEB_CONFIG_API_URL;

  async getDashboardReport(query: Object) {
    return this.get(`view`, query);
  }

  async getMapOverlay(query: Object) {
    return this.get(`measureData`, query);
  }
}
