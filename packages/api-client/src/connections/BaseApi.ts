/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from './ApiConnection';

export class BaseApi {
  protected readonly connection: ApiConnection;

  public constructor(connection: ApiConnection) {
    this.connection = connection;
  }
}
