/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportSurveyResponsesRequest } from '@tupaia/types';

export type ExportSurveyResponsesRequest = Request<
  TupaiaWebExportSurveyResponsesRequest.Params,
  TupaiaWebExportSurveyResponsesRequest.ResBody,
  TupaiaWebExportSurveyResponsesRequest.ReqBody,
  TupaiaWebExportSurveyResponsesRequest.ReqQuery
>;

export class ExportSurveyResponsesRoute extends Route<ExportSurveyResponsesRequest> {
  protected readonly type = 'download';

  public async buildResponse() {
    const { query, ctx } = this.req;
    const {
      organisationUnitCode,
      surveyCodes,
      latest,
      startDate,
      endDate,
      timeZone,
      itemCode,
      easyReadingMode,
    } = query;
    const dashboardItem = (
      await ctx.services.central.fetchResources('dashboardItems', { code: itemCode })
    )[0];

    if (!dashboardItem) {
      throw new Error(`Invalid itemCode ${itemCode}`);
    }

    const centralParams: Record<string, any> = {
      latest,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
      reportName: dashboardItem.config?.name,
      easyReadingMode,
    };

    if (organisationUnitCode.length === 2) {
      // The code is only two characters, must be the 2 character country ISO code
      centralParams.countryCode = organisationUnitCode;
    } else {
      centralParams.entityCode = organisationUnitCode;
    }

    const response = await ctx.services.central.fetchResources(
      'export/surveyResponses',
      centralParams,
    );

    return {
      contents: response,
      filePath: 'test.xlsx',
      type: '.xlsx',
    };
  }
}
