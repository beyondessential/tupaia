/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { AuthHandler } from './types';
import { ApiConnection, EntityApi, CentralApi } from './connections';
import { PRODUCTION_BASE_URLS, ServiceBaseUrlSet } from './constants';

export class TupaiaApiClient {
  public readonly entity: EntityApi;

  public readonly central: CentralApi;

  public constructor(authHandler: AuthHandler, baseUrls: ServiceBaseUrlSet = PRODUCTION_BASE_URLS) {
    this.entity = new EntityApi(new ApiConnection(authHandler, baseUrls.entity));
    this.central = new CentralApi(new ApiConnection(authHandler, baseUrls.central));
  }
}
