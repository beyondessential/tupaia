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
    const { reportId, surveyCodes } = this.query;
    const { dataBuilderConfig } = await DashboardReport.findById(reportId);
    const surveyCodesMatchDashboardReport = surveyCodes.every(surveyCode =>
      dataBuilderConfig.surveyCodes.some(({ code }) => code === surveyCode),
    );
    if (!surveyCodesMatchDashboardReport) {
      throw new PermissionsError(`Survey codes do not match the report ${reportId}`);
    }
  }
}
