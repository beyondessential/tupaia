/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { downloadPageAsPDF } from '@tupaia/server-utils';

export type ExportSurveyResponseRequest = Request<
  {
    surveyResponseId: string;
  },
  {
    contents: Buffer;
    type: string;
  },
  {
    baseUrl: string;
    cookieDomain: string;
    locale: string;
    timezone: string;
  },
  Record<string, unknown>
>;

export class ExportSurveyResponseRoute extends Route<ExportSurveyResponseRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { surveyResponseId } = this.req.params;
    const { baseUrl, cookieDomain, locale, timezone } = this.req.body;
    const { cookie } = this.req.headers;

    if (!cookie) {
      throw new Error(`Must have a valid session to export a dashboard`);
    }

    const pdfPageUrl = `${baseUrl}/export/${surveyResponseId}?locale=${locale}`;

    const buffer = await downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain, false, true, timezone);

    return {
      contents: buffer,
      type: 'application/pdf',
    };
  }
}
