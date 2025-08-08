import { NextFunction, Request, Response } from 'express';
import { Route as BaseRoute, ExpressRequest, ExpressResponse } from '@tupaia/server-boilerplate';
import { EntityConnection, CentralConnection, ReportConnection } from '../connections';

export class Route<
  Req extends ExpressRequest<Req> = Request,
  Res extends ExpressResponse<Req> = Response,
> extends BaseRoute<Req, Res> {
  protected readonly entityConnection: EntityConnection;
  protected readonly centralConnection: CentralConnection;
  protected readonly reportConnection: ReportConnection;

  public constructor(req: Req, res: Res, next: NextFunction) {
    super(req, res, next);
    const { session } = this.req;
    const { entity: entityApi, central: centralApi, report: reportApi } = this.req.ctx.services;
    this.entityConnection = new EntityConnection(entityApi);
    this.centralConnection = new CentralConnection(centralApi, session?.email || '');
    this.reportConnection = new ReportConnection(reportApi);
  }
}
