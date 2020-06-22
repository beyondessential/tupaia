/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DashboardReport } from '/models';
import { PermissionsError } from '@tupaia/utils';
import { DashboardPermissionsChecker } from './DashboardPermissionsChecker';

const getAllowedSurveyCodes = dataBuilderConfig => {
  const { surveys, surveyCodes } = dataBuilderConfig;
  return surveys ? surveys.map(({ code }) => code) : surveyCodes;
};

export class ExportSurveyResponsesPermissionsChecker extends DashboardPermissionsChecker {
  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // check that the selected surveys sits within the report
    const { viewId, surveyCodes: selectedCodeInput } = this.query;
    const report = await DashboardReport.findById(viewId);
    const allowedCodes = getAllowedSurveyCodes(report.dataBuilderConfig);
    const selectedCodes = selectedCodeInput.split(',');

    const surveyCodesMatchDashboardReport = selectedCodes.every(selectedCode =>
      allowedCodes.includes(selectedCode),
    );
    if (!surveyCodesMatchDashboardReport) {
      throw new PermissionsError(`Survey codes do not match the report ${viewId}`);
    }
  }
}
