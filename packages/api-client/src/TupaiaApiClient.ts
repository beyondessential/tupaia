import { AuthHandler } from './types';
import {
  ApiConnection,
  AuthApi,
  CentralApi,
  DataTableApi,
  EntityApi,
  ReportApi,
  WebConfigApi,
  AuthApiInterface,
  CentralApiInterface,
  DataTableApiInterface,
  EntityApiInterface,
  ReportApiInterface,
  WebConfigApiInterface,
} from './connections';
import { PRODUCTION_BASE_URLS, ServiceBaseUrlSet } from './constants';
import { SyncApi, SyncApiInterface } from './connections/SyncApi';

export class TupaiaApiClient {
  public readonly entity: EntityApiInterface;
  public readonly central: CentralApiInterface;
  public readonly dataTable: DataTableApiInterface;
  public readonly auth: AuthApiInterface;
  public readonly report: ReportApiInterface;
  public readonly webConfig: WebConfigApiInterface;
  public readonly sync: SyncApiInterface;

  public constructor(authHandler: AuthHandler, baseUrls: ServiceBaseUrlSet = PRODUCTION_BASE_URLS) {
    this.auth = new AuthApi(new ApiConnection(authHandler, baseUrls.auth));
    this.entity = new EntityApi(new ApiConnection(authHandler, baseUrls.entity));
    this.central = new CentralApi(new ApiConnection(authHandler, baseUrls.central));
    this.report = new ReportApi(new ApiConnection(authHandler, baseUrls.report));
    this.dataTable = new DataTableApi(new ApiConnection(authHandler, baseUrls.dataTable));
    this.webConfig = new WebConfigApi(new ApiConnection(authHandler, baseUrls.webConfig));
    this.sync = new SyncApi(new ApiConnection(authHandler, baseUrls.sync));
  }
}
