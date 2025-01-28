import { QueryParameters } from '../types';
import { RequestBody } from './ApiConnection';
import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class ReportApi extends BaseApi {
  public async testReport(query: QueryParameters, body: RequestBody) {
    return this.connection.post('testReport', query, body);
  }

  public async fetchTransformSchemas() {
    return this.connection.get('fetchTransformSchemas');
  }

  public async fetchReport(reportCode: string, query?: QueryParameters | null) {
    return this.connection.get(`fetchReport/${reportCode}`, query);
  }
}

export interface ReportApiInterface extends PublicInterface<ReportApi> {}
