import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebLegacyMapOverlayReportRequest } from '@tupaia/types';

export type LegacyMapOverlayReportRequest = Request<
  TupaiaWebLegacyMapOverlayReportRequest.Params,
  TupaiaWebLegacyMapOverlayReportRequest.ResBody,
  TupaiaWebLegacyMapOverlayReportRequest.ReqBody,
  TupaiaWebLegacyMapOverlayReportRequest.ReqQuery
>;

export class LegacyMapOverlayReportRoute extends Route<LegacyMapOverlayReportRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { mapOverlayCode, legacy } = this.req.params;

    return ctx.services.webConfig.fetchMeasureData(mapOverlayCode, { legacy, ...query });
  }
}
