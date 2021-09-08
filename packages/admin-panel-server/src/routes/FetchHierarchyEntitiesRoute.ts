/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { QueryParameters, Route } from '@tupaia/server-boilerplate';

import { EntityConnection } from '../connections';

export type FetchHierarchyEntitiesRequest = Request<
  { hierarchyName: string; entityCode: string },
  Record<string, unknown>[],
  Record<string, never>,
  { fields?: string; search?: string }
>;

export class FetchHierarchyEntitiesRoute extends Route<FetchHierarchyEntitiesRequest> {
  private readonly entityConnection: EntityConnection;

  constructor(req: FetchHierarchyEntitiesRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.entityConnection = new EntityConnection(req.session);
  }

  async buildResponse() {
    const { hierarchyName, entityCode } = this.req.params;
    const { fields, search } = this.req.query;
    const queryParams: QueryParameters = {};
    if (fields) {
      queryParams.fields = fields;
    }
    if (search) {
      queryParams.filter = `name=@${search}`;
    }
    return this.entityConnection.getEntities(hierarchyName, entityCode, queryParams);
  }
}
