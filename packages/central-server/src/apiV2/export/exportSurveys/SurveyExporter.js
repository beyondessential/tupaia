import xlsx from 'xlsx';

import { SurveyModel } from '@tupaia/database';
import { getExportPathForUser } from '@tupaia/server-utils';
import { DatabaseError } from '@tupaia/utils';
import winston from '../../../log';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { RowBuilder } from './RowBuilder';
import { assertCanExportSurveys } from './assertCanExportSurveys';
import { SurveyMetadataConfigCellBuilder } from './cellBuilders';

const FILE_PREFIX = 'survey_export';

export class SurveyExporter {
  constructor(models, userId, assertPermissions) {
    this.models = models;
    this.userId = userId;
    this.assertPermissions = assertPermissions;
    this.surveyMetadataConfigCellBuilder = new SurveyMetadataConfigCellBuilder(models);
  }

  async buildMetadataRow({ integration_metadata: metadata }) {
    const config = await this.surveyMetadataConfigCellBuilder.build(metadata);
    return Object.entries(config).length ? { type: 'SurveyMetadata', config } : null;
  }

  async checkPermissionsError(surveys) {
    let permissionsError;

    try {
      const exportSurveysChecker = async accessPolicy =>
        assertCanExportSurveys(accessPolicy, this.models, surveys);
      await this.assertPermissions(
        assertAnyPermissions([assertBESAdminAccess, exportSurveysChecker]),
      );
    } catch (error) {
      permissionsError = error.message;
    }

    return permissionsError;
  }

  async exportToFile(surveyId, surveyCode) {
    // Create empty workbook to contain survey response export
    const workbook = { SheetNames: [], Sheets: {} };

    try {
      let surveys = [];
      if (surveyId) {
        surveys = [await this.models.survey.findById(surveyId)];
      } else {
        const criteria = surveyCode ? { code: surveyCode } : {};
        surveys = await this.models.survey.find(criteria);
      }

      const permissionsError = await this.checkPermissionsError(surveys);

      // If there is permission error, export an empty excel sheet with the error message
      if (permissionsError) {
        const sheetName = 'Error';
        workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet([[permissionsError]]);
      } else {
        for (const currentSurvey of surveys) {
          const rows = await SurveyModel.findQuestionsInSurvey(this.models, currentSurvey.id);
          const rowBuilder = new RowBuilder(this.models, rows);

          const rowsForExport = await Promise.all(rows.map(rowBuilder.build));
          const metadataRow = await this.buildMetadataRow(currentSurvey);
          if (metadataRow) rowsForExport.push(metadataRow);

          const sheetName = currentSurvey.name.substring(0, 31);
          workbook.SheetNames.push(sheetName);
          workbook.Sheets[sheetName] = xlsx.utils.json_to_sheet(rowsForExport);
        }
      }
    } catch (error) {
      winston.error(error);
      throw new DatabaseError('exporting survey', error);
    }

    const filePath = `${getExportPathForUser(this.userId)}/${FILE_PREFIX}_${Date.now()}.xlsx`;
    xlsx.writeFile(workbook, filePath, { bookSST: true });
    return filePath;
  }
}
