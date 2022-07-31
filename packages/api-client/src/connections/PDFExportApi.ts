/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */

import { BaseApi } from './BaseApi';

export class PDFExportApi extends BaseApi {
  public async getPDF(pdfPageUrl: string) {
    const { data: bufferObject } = await this.connection.post(
      `pdf`,
      {},
      {
        pdfPageUrl,
      },
    );
    return { data: Buffer.from(bufferObject) };
  }
}
