/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { CentralConnection } from '../connections';

export type UpdateSurveyResponseRequest = Request<{ id: string }, any, any, any>;

export class UpdateSurveyResponseRoute extends Route<UpdateSurveyResponseRequest> {
  private readonly centralConnection: CentralConnection;

  public constructor(req: UpdateSurveyResponseRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
    const { id } = this.req.params;
    const { status } = this.req.body;
    return this.centralConnection.updateSurveyResponse(id, { approval_status: status });
  }
}
