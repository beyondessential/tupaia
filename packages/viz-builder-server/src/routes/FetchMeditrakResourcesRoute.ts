/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import assert from 'assert';

import { Route } from '@tupaia/server-boilerplate';

import { MeditrakConnection } from '../connections';

const DEFAULT_LIMIT = 100;

export abstract class FetchMeditrakResourcesRoute extends Route {
  static endpoint: string = '';

  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.headers.authorization);

    assert.notStrictEqual(this.endpoint, '');
  }

  get endpoint() {
    return this.constructor.endpoint;
  }

  abstract buildColumns(): string[]
  
  abstract buildFilter(): object

  async buildResponse() {
    const { limit = DEFAULT_LIMIT } = this.req.query;
    const columns = JSON.stringify(this.buildColumns());
    const filter = JSON.stringify(this.buildFilter());
    return this.meditrakConnection.fetchResources(this.endpoint, {
      columns,
      filter,
      pageSize: limit
    });
  }
}
