/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import { DatabaseError } from '@tupaia/utils';

import { findQuestionsInSurvey } from '../../dataAccessors';
import { RowBuilder } from './RowBuilder';
import { SurveyMetadataConfigCellBuilder } from './cellBuilders';
import { assertCanExportSurveys } from './assertCanExportSurveys';

const FILE_TITLE = 'exports/survey_export';

export class SurveyExporter {
  constructor(models, assertPermissions) {
    this.models = models;
    this.assertPermissions = assertPermissions;
    this.surveyMetadataConfigCellBuilder = new SurveyMetadataConfigCellBuilder(models);
  }

  async buildMetadataRow({ integration_metadata: metadata }) {
    const config = await this.surveyMetadataConfigCellBuilder.build(metadata);
    return Object.entries(config).length ? { type: 'SurveyMetadata', config } : null;
  }

  async exportToFile(surveyId, surveyCode) {
    // Create empty workbook to contain survey response export
    const workbook = { SheetNames: [], Sheets: {} };

    let surveys = [];
    if (surveyId) {
      surveys = [await this.models.survey.findById(surveyId)];
    } else {
      const criteria = surveyCode ? { code: surveyCode } : {};
      surveys = await this.models.survey.find(criteria);
    }

    let permissionError;

    try {
      const exportSurveysChecker = async accessPolicy =>
        assertCanExportSurveys(accessPolicy, this.models, surveys);
      await this.assertPermissions(exportSurveysChecker);
    } catch (error) {
      permissionError = [[error.message]];
    }

    if (permissionError) {
      const sheetName = 'Error';
      workbook.SheetNames.push(sheetName);
      workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(permissionError);
    } else {
      try {
        for (let i = 0; i < surveys.length; i += 1) {
          const currentSurvey = surveys[i];
          const rows = await findQuestionsInSurvey(this.models, currentSurvey.id);
          const rowBuilder = new RowBuilder(this.models, rows);

          const rowsForExport = await Promise.all(rows.map(rowBuilder.build));
          const metadataRow = await this.buildMetadataRow(currentSurvey);
          if (metadataRow) rowsForExport.push(metadataRow);

          const sheetName = currentSurvey.name.substring(0, 31);
          workbook.SheetNames.push(sheetName);
          workbook.Sheets[sheetName] = xlsx.utils.json_to_sheet(rowsForExport);
        }
      } catch (error) {
        console.log(error);
        throw new DatabaseError('exporting survey', error);
      }
    }

    const filePath = `${FILE_TITLE}_${Date.now()}.xlsx`;
    xlsx.writeFile(workbook, filePath, { bookSST: true });
    return filePath;
  }
}
