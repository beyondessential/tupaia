/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { downloadPageAsPdf } from '@tupaia/tsutils';
import { convertToCDNHost } from '@tupaia/utils';

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
  public constructor(req: PDFExportRequest, res: Response, next: NextFunction) {
    super(req, res, next);
    this.type = 'download';
  }

  public async buildResponse() {
    const { pdfPageUrl } = this.req.body;
    const { cookie, host, via } = this.req.headers;
    if (!host) {
      throw new Error('host must be provided');
    }
    const cookieDomain = via && via.includes('cloudfront.net') ? convertToCDNHost(host) : host;

    const buffer = await downloadPageAsPdf(pdfPageUrl, cookie, cookieDomain);
    this.res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment',
    });

    return { contents: buffer };
  }
}
