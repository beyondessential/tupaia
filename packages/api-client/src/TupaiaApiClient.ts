/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { AuthHandler } from './types';
import {
  ApiConnection,
  AuthApi,
  EntityApi,
  CentralApi,
  ReportApi,
  EntityApiInterface,
  CentralApiInterface,
  AuthApiInterface,
  ReportApiInterface,
} from './connections';
import { PRODUCTION_BASE_URLS, ServiceBaseUrlSet } from './constants';

export class TupaiaApiClient {
  public readonly entity: EntityApiInterface;
  public readonly central: CentralApiInterface;
  public readonly auth: AuthApiInterface;
  public readonly report: ReportApiInterface;

  public constructor(authHandler: AuthHandler, baseUrls: ServiceBaseUrlSet = PRODUCTION_BASE_URLS) {
    this.auth = new AuthApi(new ApiConnection(authHandler, baseUrls.auth));
    this.entity = new EntityApi(new ApiConnection(authHandler, baseUrls.entity));
    this.central = new CentralApi(new ApiConnection(authHandler, baseUrls.central));
    this.report = new ReportApi(new ApiConnection(authHandler, baseUrls.report));
  }
}
