/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request, Response } from 'express';
import { Route as BaseRoute, ExpressRequest, ExpressResponse } from '@tupaia/server-boilerplate';
import { UnauthenticatedError } from '@tupaia/utils';
import { EntityConnection, MeditrakConnection, ReportConnection } from '../connections';

export class Route<Req extends ExpressRequest<Req> = Request,
  Res extends ExpressResponse<Req> = Response> extends BaseRoute<Req, Res> {
  protected entityConnection?: EntityConnection;

  protected meditrakConnection?: MeditrakConnection;

  protected reportConnection?: ReportConnection;

  handle() {
    try {
      const { session } = this.req;
      this.entityConnection = new EntityConnection(session);
      this.meditrakConnection = new MeditrakConnection(session);
      this.reportConnection = new ReportConnection(session);
    } catch (e) {
      throw new UnauthenticatedError('Unauthenticated');
    }
    return super.handle();
  }
}
