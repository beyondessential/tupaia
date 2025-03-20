import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { downloadPageAsPdf } from '@tupaia/server-utils';

export interface PDFExportRequest
  extends Request<
    Record<string, never>,
    { contents: Uint8Array },
    { pdfPageUrl: string },
    Record<string, unknown>
  > {}

export class PDFExportRoute extends Route<PDFExportRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { pdfPageUrl } = this.req.body;
    const { cookie, host: cookieDomain } = this.req.headers;

    const buffer = await downloadPageAsPdf({
      pdfPageUrl,
      userCookie: cookie,
      cookieDomain,
    });
    this.res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'attachment',
    });

    return { contents: buffer };
  }
}
