import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import type { TupaiaWebExportSurveyResponsesRequest } from '@tupaia/types';
import { ValidationError } from '@tupaia/utils';
import type { QueryParams } from './types';
import { EMAIL_TIMEOUT_SETTINGS, handleExportResponse } from './utils';

export type ExportSurveyResponsesRequest = Request<
  TupaiaWebExportSurveyResponsesRequest.Params,
  TupaiaWebExportSurveyResponsesRequest.ResBody,
  TupaiaWebExportSurveyResponsesRequest.ReqBody,
  TupaiaWebExportSurveyResponsesRequest.ReqQuery
>;

export class ExportSurveyResponsesRoute extends Route<ExportSurveyResponsesRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    const {
      ctx,
      query: {
        organisationUnitCode,
        surveyCodes,
        latest,
        startDate,
        endDate,
        timeZone,
        itemCode,
        easyReadingMode,
      },
    } = this.req;

    // Query params may be arrays or objects at runtime (e.g. `?itemCode=a&itemCode=b`)
    if (typeof itemCode !== 'string') throw new ValidationError('itemCode must be a string');
    if (organisationUnitCode !== undefined && typeof organisationUnitCode !== 'string') {
      throw new ValidationError('organisationUnitCode must be a string');
    }

    const [dashboardItem] = await ctx.services.central.fetchResources('dashboardItems', {
      filter: { code: itemCode },
    });
    if (!dashboardItem) throw new Error(`Invalid itemCode ${itemCode}`);

    const centralQuery: QueryParams<TupaiaWebExportSurveyResponsesRequest.ReqQuery> & {
      reportName: string;
      countryCode?: string;
      entityCode?: string;
    } = {
      latest,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
      reportName: dashboardItem.config?.name,
      easyReadingMode,
      ...EMAIL_TIMEOUT_SETTINGS,
    };

    if (organisationUnitCode?.length === 2) {
      // The code is only two characters, must be the 2 character country ISO code
      centralQuery.countryCode = organisationUnitCode;
    } else {
      centralQuery.entityCode = organisationUnitCode;
    }

    const response = await ctx.services.central.fetchResources(
      'export/surveyResponses',
      centralQuery,
    );

    if (response.emailTimeoutHit) {
      return response;
    }

    return handleExportResponse(response);
  }
}
