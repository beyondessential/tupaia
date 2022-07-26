/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { handleWith, MicroServiceApiBuilder } from '@tupaia/server-boilerplate';
import { TupaiaDatabase } from '@tupaia/database';
import { PDFExportRoute, PDFExportRequest } from '../routes/PDFExportRoute';

/**
 * Set up express server with middleware
 */
export function createApp(db = new TupaiaDatabase()) {
  return new MicroServiceApiBuilder(db, 'pdfExport')
    .useBasicBearerAuth()
    .post<PDFExportRequest>('pdf', handleWith(PDFExportRoute))
    .build();
}
