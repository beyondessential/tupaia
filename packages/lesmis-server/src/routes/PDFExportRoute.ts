/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { getBaseUrlsForHost, LOCALHOST_BASE_URLS, TupaiaApiClient } from '@tupaia/api-client';
import { authHandlerProvider } from '../auth/authHandlerProvider';

type Body = {
  pdfPageUrl: string;
};

export type PDFExportRequest = Request<
  Record<string, never>,
  { contents: Buffer },
  Body,
  Record<string, any>
>;

export class PDFExportRoute extends Route<PDFExportRequest> {
  private readonly apiClient: TupaiaApiClient;

  public constructor(req: PDFExportRequest, res: Response, next: NextFunction) {
    super(req, res, next);
    this.type = 'download';
    const baseUrls =
      process.env.NODE_ENV === 'test' ? LOCALHOST_BASE_URLS : getBaseUrlsForHost(this.req.hostname);
    this.apiClient = new TupaiaApiClient(authHandlerProvider(this.req), baseUrls);
  }

  public async buildResponse() {
    const { pdfPageUrl } = this.req.body;

    const { data: buffer } = await this.apiClient.pdfExport.getPDF(pdfPageUrl);
    this.res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment',
    });
    return { contents: buffer };
  }
}
