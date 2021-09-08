import xlsx from 'xlsx';
import fs from 'fs';
import { getExportDatesString } from '@tupaia/utils';

import { requestFromTupaiaConfigServer } from './requestFromTupaiaConfigServer';
import { USER_SESSION_CONFIG } from '/authSession';
import { RouteHandler } from '/apiV1/RouteHandler';
import { ExportSurveyResponsesPermissionsChecker } from '/apiV1/permissions';
import { formatMatrixDataForExcel } from './excelFormatters/formatMatrixDataForExcel';

const EXPORT_FILE_TITLE = 'survey_response_export';
const EXPORT_DIRECTORY = 'exports';

export class ExportSurveyDataHandler extends RouteHandler {
  static PermissionsChecker = ExportSurveyResponsesPermissionsChecker;

  async handleRequest() {
    await super.handleRequest();
    const {
      organisationUnitCode,
      itemCode,
      dashboardCode,
      projectCode,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
    } = this.query;

    const sessionCookieName = USER_SESSION_CONFIG.cookieName;
    const sessionCookie = this.req.cookies[sessionCookieName];
    const { report_code: reportCode, legacy, config } = await this.models.dashboardItem.findOne({
      code: itemCode,
    });

    // Get the data for the chart
    const queryParameters = {
      itemCode,
      organisationUnitCode,
      dashboardCode,
      projectCode,
      surveyCodes,
      startDate,
      endDate,
      legacy,
      isExpanded: true,
    };

    const data = await requestFromTupaiaConfigServer(
      `report/${reportCode}`,
      queryParameters,
      sessionCookieName,
      sessionCookie,
    );

    const sheetNames = [];
    const sheets = {};
    const { name: organisationUnitName } = await this.models.entity.findOne({
      code: organisationUnitCode,
    });
    const reportTitle = `${config.name}, ${organisationUnitName}`;

    Object.entries(data.data).forEach(([surveyName, surveyData]) => {
      const header = surveyData.data.columns.length
        ? `Data ${getExportDatesString(startDate, endDate)}`
        : `No data for ${surveyName} ${getExportDatesString(startDate, endDate)}`;

      const titleAndHeaderData = [[`${reportTitle}: ${surveyName}`], [header]];
      // Using array of arrays (aoa) input as transformations like mergeSurveys
      // increases the likelyhood of columns with same title (leads to missing keys in object json (aoo))
      const formattedData = surveyData.data.columns.length
        ? formatMatrixDataForExcel(surveyData.data, timeZone)
        : [];

      // Header and title
      let sheet = xlsx.utils.aoa_to_sheet(titleAndHeaderData);

      const { skipHeader = true } = surveyData;

      // Formatted data using array of arrays input
      sheet = xlsx.utils.sheet_add_aoa(sheet, formattedData, {
        skipHeader,
        origin: -1, // Append to bottom of worksheet starting on first column
      });

      const sheetName = surveyName.substring(0, 31); // stay within excel sheet name limit

      sheetNames.push(sheetName);
      sheets[sheetName] = sheet;
    });

    const workbook = {
      SheetNames: sheetNames,
      Sheets: sheets,
    };

    if (!(await fs.existsSync(EXPORT_DIRECTORY))) {
      await fs.mkdirSync(EXPORT_DIRECTORY);
    }

    const filePath = `${EXPORT_DIRECTORY}/${EXPORT_FILE_TITLE}_${Date.now()}.xlsx`;
    xlsx.writeFile(workbook, filePath);
    this.res.download(filePath, () => {
      fs.unlinkSync(filePath); // delete export file after download
    });
  }
}
