import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { downloadPageAsPDF } from '@tupaia/server-utils';

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
    const { cookie, host: cookieDomain } = this.req.headers;

    const buffer = await downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain);
    this.res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment',
    });

    return { contents: buffer };
  }
}
