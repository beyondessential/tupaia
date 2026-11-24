import type { Request } from 'express';
import { ZodError } from 'zod';

import { Route } from '@tupaia/server-boilerplate';
import type { TupaiaWebExportSurveyResponsesRequest } from '@tupaia/types';
import { NotFoundError, ValidationError } from '@tupaia/utils';
import {
  type ExportSurveyResponsesQuery,
  exportSurveyResponsesQuerySchema,
} from './exportSurveyResponsesQuerySchema';
import type { QueryParams } from './types';
import { EMAIL_TIMEOUT_SETTINGS, handleExportResponse } from './utils';

export interface ExportSurveyResponsesRequest
  extends Request<
    TupaiaWebExportSurveyResponsesRequest.Params,
    TupaiaWebExportSurveyResponsesRequest.ResBody,
    TupaiaWebExportSurveyResponsesRequest.ReqBody,
    TupaiaWebExportSurveyResponsesRequest.ReqQuery
  > {}

export class ExportSurveyResponsesRoute extends Route<ExportSurveyResponsesRequest> {
  protected readonly type = 'download';

  /** Query params may be arrays or objects at runtime (e.g. `?itemCode=a&itemCode=b`) */
  private parseQuery(): ExportSurveyResponsesQuery {
    try {
      return exportSurveyResponsesQuerySchema.parse(this.req.query);
    } catch (error) {
      if (!(error instanceof ZodError)) throw error;
      // Keep the message free of colons: tupaia-web strips everything up to the first `: `
      const invalidParams = [...new Set(error.issues.map(({ path }) => path.join('.')))];
      const details = error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`);
      throw new ValidationError(`Invalid query parameters (${invalidParams.join(', ')})`, details);
    }
  }

  public async buildResponse() {
    const { ctx } = this.req;
    const {
      organisationUnitCode,
      surveyCodes,
      latest,
      startDate,
      endDate,
      timeZone,
      itemCode,
      easyReadingMode,
    } = this.parseQuery();

    const [dashboardItem] = await ctx.services.central.fetchResources('dashboardItems', {
      filter: { code: itemCode },
    });
    if (!dashboardItem) throw new NotFoundError(`No dashboard item found with code ${itemCode}`);

    const centralQuery: QueryParams<
      Omit<ExportSurveyResponsesQuery, 'itemCode' | 'organisationUnitCode'>
    > & { countryCode?: string; entityCode?: string; reportName: string } = {
      latest,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
      reportName: dashboardItem.config?.name,
      easyReadingMode,
      ...EMAIL_TIMEOUT_SETTINGS,
    };

    if (organisationUnitCode.length === 2) {
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
