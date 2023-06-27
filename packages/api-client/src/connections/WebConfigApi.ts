/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { QueryParameters } from '../types';
import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class WebConfigApi extends BaseApi {
  public async fetchReport(reportCode: string, query?: QueryParameters | null) {
    return this.connection.get(`report/${reportCode}`, query);
  }
  public async fetchMeasureData(query?: QueryParameters | null) {
    return this.connection.get(`measureData`, query);
  }
  public async fetchProjects() {
    return this.connection.get('projects');
  }
}

export interface WebConfigApiInterface extends PublicInterface<WebConfigApi> {}
