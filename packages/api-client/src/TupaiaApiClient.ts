/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */


import { AuthHandler } from './types';
import { ApiConnectionBuilder, EntityApi } from './connections';

export class TupaiaApiClient {

  public readonly entity: EntityApi;

  constructor(authHandler: AuthHandler) {
    this.entity = new ApiConnectionBuilder()
      .handleAuthWith(authHandler)
      .buildAs(EntityApi);
  }

}

