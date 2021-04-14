/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '@tupaia/server-boilerplate';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';
const { WEB_CONFIG_API_URL = 'http://localhost:8000/api/v1' } = process.env;

export class WebConfigConnection extends SessionHandlingApiConnection {
  baseUrl = WEB_CONFIG_API_URL;

  async fetchDashboardReport(query: QueryParameters) {
    return this.get('view', query);
  }

  async fetchMapOverlayData(query: QueryParameters) {
    return this.get('measureData', query);
  }

  async fetchMapOverlays(query: QueryParameters) {
    const response = await this.get('measures', query);
    return response.measures;
  }
}
