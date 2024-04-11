/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '@tupaia/server-boilerplate';
import { getEnvVarOrDefault } from '@tupaia/utils';
import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';

/**
 * @deprecated use @tupaia/api-client
 */
export class WebConfigConnection extends SessionHandlingApiConnection {
  public baseUrl = getEnvVarOrDefault('WEB_CONFIG_API_URL', 'http://localhost:8000/api/v1');

  public async fetchDashboard(query: QueryParameters) {
    return this.get('dashboards', query);
  }

  public async fetchDashboardReport(reportCode: string, query: QueryParameters) {
    return this.get(`report/${reportCode}`, query);
  }

  public async fetchMapOverlayData(query: QueryParameters) {
    return this.get('measureData', query);
  }

  public async fetchMapOverlays(query: QueryParameters) {
    const response = await this.get('measures', query);
    return response.measures;
  }
}
