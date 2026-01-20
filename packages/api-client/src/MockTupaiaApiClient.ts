import {
  AuthApiInterface,
  CentralApiInterface,
  DataTableApiInterface,
  EntityApiInterface,
  ReportApiInterface,
  WebConfigApiInterface,
  SyncApiInterface
} from './connections';

import {
  MockAuthApi,
  MockCentralApi,
  MockDataTableApi,
  MockEntityApi,
  MockReportApi,
  MockWebConfigApi,
} from './connections/mocks';
import { MockSyncApi } from './connections/mocks/MockSyncApi';

export class MockTupaiaApiClient {
  public readonly auth: AuthApiInterface;
  public readonly central: CentralApiInterface;
  public readonly dataTable: DataTableApiInterface;
  public readonly entity: EntityApiInterface;
  public readonly report: ReportApiInterface;
  public readonly webConfig: WebConfigApiInterface;
  public readonly sync: SyncApiInterface;
  
  public constructor({
    auth = new MockAuthApi(),
    central = new MockCentralApi(),
    dataTable = new MockDataTableApi(),
    entity = new MockEntityApi(),
    report = new MockReportApi(),
    webConfig = new MockWebConfigApi(),
    sync = new MockSyncApi(),
  } = {}) {
    this.auth = auth;
    this.central = central;
    this.dataTable = dataTable;
    this.entity = entity;
    this.report = report;
    this.webConfig = webConfig;
    this.sync = sync;
  }
}
