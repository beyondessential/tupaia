/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME } from '../constants';

export type MapOverlaysRequest = Request<{ entityCode: string }, any, any, any>;

export class MapOverlaysRoute extends Route<MapOverlaysRequest> {
  private readonly webConfigConnection: WebConfigConnection;

  constructor(req: MapOverlaysRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.webConfigConnection = new WebConfigConnection(req.session);
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    return this.webConfigConnection.fetchMapOverlays({
      organisationUnitCode: entityCode,
      projectCode: LESMIS_PROJECT_NAME,
    });
  }
}
