/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';

export class UpdateSurveyResponseRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { id } = this.req.params;
    const { status } = this.req.body;
    return this.meditrakConnection.updateSurveyResponse(id, { approval_status: status });
  }
}
