/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { BaseApi } from './BaseApi';

export class PDFExportApi extends BaseApi {
  public async getPDF(pdfPageUrl: string) {
    return this.connection.post(
      `pdf`,
      {},
      {
        pdfPageUrl,
      },
    );
  }
}
