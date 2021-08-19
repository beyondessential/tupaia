/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */


import { AuthHandler } from './types';
import { ApiConnection, EntityApi } from './connections';
import { ENDPOINT_BASE_URLS, EndpointBaseUrlSet } from './constants';

export class TupaiaApiClient {

  public readonly entity: EntityApi;

  constructor(authHandler: AuthHandler, baseUrls: EndpointBaseUrlSet = ENDPOINT_BASE_URLS) {
    this.entity = new EntityApi(new ApiConnection(authHandler, baseUrls.entity));
  }

}