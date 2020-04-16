/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DashboardReport } from '/models';
import { PermissionsError } from '@tupaia/utils';
import { DashboardPermissionsChecker } from './DashboardPermissionsChecker';

export class ExportSurveyResponsesPermissionsChecker extends DashboardPermissionsChecker {
  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // check that the selected surveys sits within the report
    const { viewId, surveyCodes } = this.query;
    const report = await DashboardReport.findById(viewId);
    const dataBuilderConfig = report.dataBuilderConfig;
    const surveyCodesMatchDashboardReport = surveyCodes
      .split(',')
      .every(surveyCode => dataBuilderConfig.surveys.some(({ code }) => code === surveyCode));
    if (!surveyCodesMatchDashboardReport) {
      throw new PermissionsError(`Survey codes do not match the report ${viewId}`);
    }
  }
}
