import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportSurveyDataRequest } from '@tupaia/types';
import { QueryParams } from './types';
import { EMAIL_TIMEOUT_SETTINGS, handleExportResponse } from './utils';

export type ExportSurveyDataRequest = Request<
  TupaiaWebExportSurveyDataRequest.Params,
  TupaiaWebExportSurveyDataRequest.ResBody,
  TupaiaWebExportSurveyDataRequest.ReqBody,
  TupaiaWebExportSurveyDataRequest.ReqQuery
>;

export class ExportSurveyDataRoute extends Route<ExportSurveyDataRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    const { query, ctx } = this.req;

    const queryParams: QueryParams<TupaiaWebExportSurveyDataRequest.ReqQuery> = {
      ...query,
      ...EMAIL_TIMEOUT_SETTINGS,
    };

    const response = await ctx.services.webConfig.fetchExport(queryParams);
    if (response.emailTimeoutHit) {
      return response;
    }
    return handleExportResponse(response);
  }
}
