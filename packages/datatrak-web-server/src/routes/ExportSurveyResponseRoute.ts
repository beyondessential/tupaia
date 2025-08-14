import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { downloadPageAsPdf } from '@tupaia/server-utils';

export interface ExportSurveyResponseRequest
  extends Request<
    { surveyResponseId: string },
    {
      contents: Uint8Array;
      type: string;
    },
    {
      baseUrl: string;
      cookieDomain: string;
      locale: string;
      timezone: string;
    },
    Record<string, unknown>
  > {}

export class ExportSurveyResponseRoute extends Route<ExportSurveyResponseRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { surveyResponseId } = this.req.params;
    const { baseUrl, cookieDomain, locale, timezone } = this.req.body;
    const { cookie } = this.req.headers;

    if (!cookie) {
      throw new Error('Must have a valid session to export a dashboard');
    }

    const pdfPageUrl = `${baseUrl}/export/${surveyResponseId}?locale=${locale}`;

    const buffer = await downloadPageAsPdf({
      cookieDomain,
      includePageNumber: true,
      pdfPageUrl,
      timezone,
      userCookie: cookie,
    });

    return {
      contents: buffer,
      type: 'application/pdf',
    };
  }
}
