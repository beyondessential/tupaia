import { WebConfigApiInterface } from '..';
import { QueryParameters } from '../../types';

export class MockWebConfigApi implements WebConfigApiInterface {
  public fetchReport(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchMapOverlays(query: QueryParameters): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchMeasureData(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchProject(_projectCode: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchProjects(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchDashboards(query: QueryParameters): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchExport(query: QueryParameters): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
