import { QueryParameters } from '../types';
import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

export class WebConfigApi extends BaseApi {
  public async fetchReport(reportCode: string, query?: QueryParameters | null) {
    return this.connection.get(`report/${reportCode}`, query);
  }
  public async fetchMapOverlays(query: QueryParameters) {
    const response = await this.connection.get('measures', query);
    return response.measures;
  }
  public async fetchMeasureData(mapOverlayCode: string, query?: QueryParameters | null) {
    return this.connection.get('measureData', { ...query, mapOverlayCode });
  }
  public async fetchProject(projectCode: string, query?: QueryParameters | null) {
    return await this.connection.get(`project/${projectCode}`, query);
  }
  public async fetchProjects(query?: QueryParameters | null) {
    return this.connection.get('projects', query);
  }
  public async fetchDashboards(query: QueryParameters) {
    return this.connection.get('dashboards', query);
  }
  public async fetchExport(query: QueryParameters) {
    return this.connection.get('export/surveyDataDownload', query);
  }
}

export interface WebConfigApiInterface extends PublicInterface<WebConfigApi> {}
