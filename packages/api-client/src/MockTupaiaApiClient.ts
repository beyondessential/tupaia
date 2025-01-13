import {
  AuthApiInterface,
  CentralApiInterface,
  DataTableApiInterface,
  EntityApiInterface,
  ReportApiInterface,
  WebConfigApiInterface,
} from './connections';

import {
  MockAuthApi,
  MockCentralApi,
  MockDataTableApi,
  MockEntityApi,
  MockReportApi,
  MockWebConfigApi,
} from './connections/mocks';

export class MockTupaiaApiClient {
  public readonly auth: AuthApiInterface;
  public readonly central: CentralApiInterface;
  public readonly dataTable: DataTableApiInterface;
  public readonly entity: EntityApiInterface;
  public readonly report: ReportApiInterface;
  public readonly webConfig: WebConfigApiInterface;

  public constructor({
    auth = new MockAuthApi(),
    central = new MockCentralApi(),
    dataTable = new MockDataTableApi(),
    entity = new MockEntityApi(),
    report = new MockReportApi(),
    webConfig = new MockWebConfigApi(),
  } = {}) {
    this.auth = auth;
    this.central = central;
    this.dataTable = dataTable;
    this.entity = entity;
    this.report = report;
    this.webConfig = webConfig;
  }
}
