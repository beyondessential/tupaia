/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DashboardVisualisationExtractor } from './DashboardVisualisationExtractor';

export class DraftReportExtractor extends DashboardVisualisationExtractor {
  validate() {
    this.validateData();
  }

  extractFromVisualisationObject() {
    return this.extractReport();
  }
}
