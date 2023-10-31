/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportSurveyResponsesRequest } from '@tupaia/types';

export type ExportSurveyResponsesRequest = Request<
  TupaiaWebExportSurveyResponsesRequest.Params,
  any,
  // TupaiaWebExportSurveyResponsesRequest.ResBody,
  TupaiaWebExportSurveyResponsesRequest.ReqBody,
  TupaiaWebExportSurveyResponsesRequest.ReqQuery
>;

const EMAIL_TIMEOUT = 30 * 1000; // 30 seconds

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
      await ctx.services.central.fetchResources('dashboardItems', {
        filter: { code: itemCode },
      })
    )[0];

    if (!dashboardItem) {
      throw new Error(`Invalid itemCode ${itemCode}`);
    }

    const centralQuery: TupaiaWebExportSurveyResponsesRequest.ReqQuery & {
      reportName: string;
      countryCode?: string;
      entityCode?: string;
      respondWithEmailTimeout: number;
    } = {
      latest,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
      reportName: dashboardItem.config?.name,
      easyReadingMode,
      respondWithEmailTimeout: EMAIL_TIMEOUT,
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
      throw new Error(
        'This export is taking a long time! The data will be emailed to you when finished.',
      );
    }

    // Extract the filename from the content-disposition header
    const contentDispositionHeader = response.headers.get('content-disposition');
    const regex = /filename="(?<filename>.*)"/; // Find the value between quotes after filename=
    const filePath: string | undefined = regex.exec(contentDispositionHeader)?.groups?.filename;

    return {
      contents: await response.buffer(),
      filePath,
      type: '.xlsx',
    };
  }
}
