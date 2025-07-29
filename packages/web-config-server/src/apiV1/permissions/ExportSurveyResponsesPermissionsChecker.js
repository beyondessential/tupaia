import { flatten } from 'es-toolkit/compat';
import { PermissionsError } from '@tupaia/utils';
import { DashboardItemPermissionsChecker } from './DashboardItemPermissionsChecker';

const getAllowedSurveyCodes = dataBuilderConfig => {
  const { surveys, surveyCodes } = dataBuilderConfig;
  return surveys ? flatten(surveys.map(({ code, codes }) => codes || code)) : surveyCodes;
};

export class ExportSurveyResponsesPermissionsChecker extends DashboardItemPermissionsChecker {
  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // check that the selected surveys sits within the report
    const { itemCode, surveyCodes: selectedCodeInput } = this.query;
    const dashboardItem = await this.fetchAndCacheDashboardItem(itemCode);

    // Old survey responses exporter only works with legacy report. Will be good to improve this.
    const report = await this.models.legacyReport.findOne({ code: dashboardItem.report_code });
    const allowedCodes = getAllowedSurveyCodes(report.data_builder_config);
    const selectedCodes = selectedCodeInput.split(',');

    const surveyCodesMatchDashboardReport = selectedCodes.every(selectedCode =>
      allowedCodes.includes(selectedCode),
    );
    if (!surveyCodesMatchDashboardReport) {
      throw new PermissionsError(
        `Survey codes do not match the report ${dashboardItem.report_code}`,
      );
    }
  }
}
