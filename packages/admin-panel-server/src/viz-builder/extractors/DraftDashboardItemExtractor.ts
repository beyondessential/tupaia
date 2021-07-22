/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DashboardVisualisationExtractor } from './DashboardVisualisationExtractor';

export class DraftDashboardItemExtractor extends DashboardVisualisationExtractor {
  validate() {
    this.validatePresentation();
  }

  extractFromVisualisationObject() {
    return this.extractDashboardItem();
  }
}
