/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import moment from 'moment';
import { generateId } from '@tupaia/database';
import {
  constructIsOneOf,
  constructRecordExistsWithId,
  DatabaseError,
  hasContent,
  ImportValidationError,
  ObjectValidator,
  respond,
  takesIdForm,
  UploadError,
  stripTimezoneFromDate,
} from '@tupaia/utils';
import { getArrayQueryParameter, extractTabNameFromQuery } from '../../utilities';
import { ANSWER_TYPES } from '../../../database/models/Answer';
import { constructAnswerValidator } from '../../utilities/constructAnswerValidator';
import {
  EXPORT_DATE_FORMAT,
  INFO_COLUMN_HEADERS,
  INFO_ROW_HEADERS,
} from '../../export/exportSurveyResponses';
import { assertCanImportSurveyResponses } from './assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { SurveyResponseUpdatePersistor } from './SurveyResponseUpdatePersistor';
import { getFailureMessage } from './getFailureMessage';

const ANSWER_TRANSFORMERS = {
  [ANSWER_TYPES.ENTITY]: async (models, answerValue) => {
    if (!answerValue) {
      return answerValue;
    }
    // entity answers are stored as codes in the spreadsheet, but ids in the db
    const entity = await models.entity.findOne({ code: answerValue });
    if (!entity) {
      throw new Error(`Could not find entity with code ${answerValue}`);
    }
    return entity.id;
  },
};

/**
 * Creates or updates survey responses by importing the new answers from an Excel file, and either
 * updating or creating each answer as appropriate
 */
export async function importSurveyResponses(req, res) {
  try {
    if (!req.file) {
      throw new UploadError();
    }
    const { models, query, userId } = req;
    const surveyNames = getArrayQueryParameter(query.surveyNames);
    const { timeZone } = query;
    if (!timeZone) {
      throw new Error(`Timezone is required`);
    }
    const config = { timeZone, userId, surveyNames };
    const updatePersistor = new SurveyResponseUpdatePersistor(models);
    const workbook = xlsx.readFile(req.file.path);
    // Go through each sheet in the workbook and process the updated survey responses
    const entitiesBySurveyName = await getEntitiesBySurveyName(
      models,
      workbook.Sheets,
      surveyNames,
    );

    const importSurveyResponsePermissionsChecker = async accessPolicy => {
      await assertCanImportSurveyResponses(accessPolicy, models, entitiesBySurveyName);
    };

    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importSurveyResponsePermissionsChecker]),
    );

    for (const surveySheets of Object.entries(workbook.Sheets)) {
      const [tabName, sheet] = surveySheets;
      const deletedResponseIds = new Set();
      const questionIds = [];

      // extract response ids and set up update batcher
      const { maxColumnIndex, maxRowIndex } = getMaxRowColumnIndex(sheet);
      const minSurveyResponseIndex = INFO_COLUMN_HEADERS.length;
      const surveyResponseIds = [];
      for (let columnIndex = minSurveyResponseIndex; columnIndex <= maxColumnIndex; columnIndex++) {
        const columnHeader = getColumnHeader(sheet, columnIndex);
        if (checkIsNewSurveyResponse(columnHeader)) {
          surveyResponseIds[columnIndex] = generateId();
        } else {
          surveyResponseIds[columnIndex] = columnHeader;
        }
      }
      updatePersistor.setupColumnsForSheet(tabName, surveyResponseIds);

      for (let columnIndex = minSurveyResponseIndex; columnIndex <= maxColumnIndex; columnIndex++) {
        const columnHeader = getColumnHeader(sheet, columnIndex);
        if (checkIsNewSurveyResponse(columnHeader)) {
          const surveyResponseId = surveyResponseIds[columnIndex];
          const surveyResponseDetails = await constructNewSurveyResponseDetails(
            models,
            tabName,
            sheet,
            columnIndex,
            { id: surveyResponseId, ...config },
          );
          updatePersistor.createSurveyResponse(surveyResponseId, surveyResponseDetails);
        } else {
          try {
            // Validate that every header takes id form, i.e. is an existing or deleted response
            await hasContent(columnHeader);
            await takesIdForm(columnHeader);
          } catch (error) {
            throw new ImportValidationError(
              `Invalid column header ${columnHeader} causing message: ${error.message} at column ${
                columnIndex + 1
              } on tab ${tabName} (should be a survey response id or "NEW" for new responses)`,
            );
          }
        }
      }

      const infoValidator = new ObjectValidator(constructInfoColumnValidators(models));
      const ignoredRowTypes = [ANSWER_TYPES.INSTRUCTION, ANSWER_TYPES.PRIMARY_ENTITY];
      for (let rowIndex = 1; rowIndex <= maxRowIndex; rowIndex++) {
        const excelRowNumber = rowIndex + 1; // +1 to make up for header
        const rowType = getInfoForRow(sheet, rowIndex, 'Type');
        if (ignoredRowTypes.includes(rowType)) {
          continue;
        }

        // Validate every cell in rows other than the header rows
        let answerValidator;
        let answerTransformer;
        const questionId = getInfoForRow(sheet, rowIndex, 'Id');
        if (questionId !== 'N/A') {
          if (questionIds.includes(questionId)) {
            throw new ImportValidationError(
              `Question id ${questionId} is not unique`,
              excelRowNumber,
            );
          }
          questionIds.push(questionId);
          const rowInfo = {};
          for (const infoKey of INFO_COLUMN_HEADERS) {
            rowInfo[infoKey] = getInfoForRow(sheet, rowIndex, infoKey);
          }
          await infoValidator.validate(rowInfo);
          const question = await models.question.findById(questionId);
          answerValidator = new ObjectValidator({}, constructAnswerValidator(models, question));
          answerTransformer = ANSWER_TRANSFORMERS[question.type];
        }

        for (
          let columnIndex = minSurveyResponseIndex;
          columnIndex <= maxColumnIndex;
          columnIndex++
        ) {
          const columnHeader = getColumnHeader(sheet, columnIndex);
          const surveyResponseId = surveyResponseIds[columnIndex];
          const answerValue = getCellContents(sheet, columnIndex, rowIndex);
          const transformedAnswerValue = answerTransformer
            ? await answerTransformer(models, answerValue)
            : answerValue;
          // If we already deleted this survey response wholesale, no need to check specific rows
          if (surveyResponseId && !deletedResponseIds.has(surveyResponseId)) {
            if (answerValidator) {
              const constructImportValidationError = message =>
                new ImportValidationError(message, excelRowNumber, columnHeader, tabName);
              await answerValidator.validate(
                { answer: transformedAnswerValue },
                constructImportValidationError,
              );
            }
            if (questionId === 'N/A') {
              // Info row (e.g. entity name): if no content delete the survey response wholesale
              if (checkIsCellEmpty(transformedAnswerValue)) {
                updatePersistor.deleteSurveyResponse(surveyResponseId);
                deletedResponseIds.add(surveyResponseId);
              } else {
                // Not deleting, make sure the submission date is set as defined in the spreadsheet
                const dataTimeInSheet = getDateStringForColumn(sheet, columnIndex);
                const newDataTime = await getNewDataTimeIfRequired(
                  models,
                  surveyResponseId,
                  dataTimeInSheet,
                );
                if (newDataTime) {
                  updatePersistor.updateDataTime(surveyResponseId, newDataTime);
                }
              }
            } else if (checkIsCellEmpty(transformedAnswerValue)) {
              // Empty question row: delete any matching answer
              updatePersistor.deleteAnswer(surveyResponseId, { questionId });
            } else if (
              rowType === ANSWER_TYPES.DATE_OF_DATA ||
              rowType === ANSWER_TYPES.SUBMISSION_DATE
            ) {
              // Don't save an answer for date of data rows, instead update the date_time of the
              // survey response. Note that this will override what is in the Date info row
              const newDataTime = await getNewDataTimeIfRequired(
                models,
                surveyResponseId,
                transformedAnswerValue.toString(),
              );
              if (newDataTime) {
                updatePersistor.updateDataTime(surveyResponseId, newDataTime);
              }
            } else {
              // Normal question row with content: update or create an answer
              updatePersistor.upsertAnswer(surveyResponseId, {
                surveyResponseId,
                questionId,
                text: transformedAnswerValue.toString(),
                type: rowType,
              });
            }
          }
        }
      }
    }

    const { failures } = await updatePersistor.process();
    const message =
      failures.length > 0
        ? `Not all responses were successfully processed:
${failures.map(getFailureMessage).join('\n')}`
        : null;
    respond(res, { message, failures });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('Import survey responses', error);
    }
  }
}

const constructNewSurveyResponseDetails = async (models, tabName, sheet, columnIndex, config) => {
  const { id, surveyNames, userId, timeZone } = config;
  if (!surveyNames) {
    throw new Error(
      'When importing new survey responses, you must specify the names of the surveys they are for',
    );
  }
  const surveyName = extractTabNameFromQuery(tabName, surveyNames);
  const survey = await models.survey.findOne({ name: surveyName });
  if (!survey) {
    throw new Error(`No survey named ${surveyName}`);
  }
  const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');
  const entity = await models.entity.findOne({ code: entityCode });
  if (!entity) {
    throw new Error(`No entity with code ${entityCode}`);
  }
  const user = await models.user.findById(userId);
  // 'Date of Data' is pulled from spreadsheet, 'Date of Survey' is current time
  if (!getInfoForColumn(sheet, columnIndex, 'Date')) {
    throw new Error('No date of data provided');
  }
  const surveyDate = getDateStringForColumn(sheet, columnIndex);
  const importDate = moment();
  return {
    id,
    survey_id: survey.id, // All survey responses within a sheet should be for the same survey
    assessor_name: `${user.first_name} ${user.last_name}`,
    user_id: user.id,
    entity_id: entity.id,
    start_time: importDate,
    end_time: importDate,
    data_time: stripTimezoneFromDate(surveyDate),
    timezone: timeZone,
  };
};

/**
 * Return all the entitites of the submitted survey responses, grouped by the survey name (sheet name) that the survey responses belong to
 * @param {*} models
 * @param {*} sheets
 * @param {*} surveyNames
 */
const getEntitiesBySurveyName = async (models, sheets, surveyNames) => {
  const entitiesGroupedBySurveyName = {};

  for (const surveySheet of Object.entries(sheets)) {
    const [tabName, sheet] = surveySheet;
    const { maxColumnIndex } = getMaxRowColumnIndex(sheet);
    const surveyName = surveyNames
      ? extractTabNameFromQuery(tabName, surveyNames) // when users submit new survey responses
      : (await getSurveyFromSheet(models, sheet)).name; // when users update existing survey responses

    for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex++) {
      const columnHeader = getColumnHeader(sheet, columnIndex);

      if (!isInfoColumn(columnIndex)) {
        const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');

        if (!entitiesGroupedBySurveyName[surveyName]) {
          entitiesGroupedBySurveyName[surveyName] = [];
        }

        entitiesGroupedBySurveyName[surveyName].push(entityCode);
      } else if (columnHeader !== INFO_COLUMN_HEADERS[columnIndex]) {
        throw new ImportValidationError(`Missing ${INFO_COLUMN_HEADERS[columnIndex]} column`);
      }
    }
  }

  return entitiesGroupedBySurveyName;
};

const isInfoColumn = columnIndex => columnIndex < INFO_COLUMN_HEADERS.length;

const getMaxRowColumnIndex = sheet => {
  const maxCell = sheet['!ref'].split(':')[1]; // The range property of the sheet looks like "A1:E56"
  const { c: maxColumnIndex, r: maxRowIndex } = xlsx.utils.decode_cell(maxCell);
  return { maxColumnIndex, maxRowIndex };
};

async function getNewDataTimeIfRequired(models, surveyResponseId, newDataTime) {
  const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
  if (!surveyResponse) return null; // probably in the process of being created, no need to update
  const currentDataTime = surveyResponse.data_time;

  if (!moment(currentDataTime).isSame(newDataTime, 'minute')) {
    return stripTimezoneFromDate(newDataTime);
  }
  return null;
}

function getDateStringForColumn(sheet, columnIndex) {
  const dateString = getInfoForColumn(sheet, columnIndex, 'Date');
  const isInExportFormat = moment(dateString, EXPORT_DATE_FORMAT, true).isValid();
  const date = isInExportFormat
    ? moment(dateString, EXPORT_DATE_FORMAT).toDate()
    : moment(dateString).toDate();
  if (isNaN(date.getTime())) {
    throw new ImportValidationError(`Invalid date ${dateString}`);
  }
  return stripTimezoneFromDate(date);
}

function checkIsCellEmpty(cellValue) {
  return cellValue === undefined || (typeof cellValue === 'string' && cellValue.length === 0);
}

function constructInfoColumnValidators(models) {
  return {
    Id: [hasContent, takesIdForm, constructRecordExistsWithId(models.question)],
    Type: [hasContent, constructIsOneOf(Object.values(ANSWER_TYPES))],
    Code: [hasContent],
    Question: [hasContent],
  };
}

// Helper to extract information like the date a survey was submitted
function getInfoForColumn(sheet, columnIndex, infoKey) {
  const rowIndex = INFO_ROW_HEADERS.indexOf(infoKey) + 1; // Add one to make up for header row
  return getCellContents(sheet, columnIndex, rowIndex);
}

// Helper to extract information like the type of question a given row represents
function getInfoForRow(sheet, rowIndex, infoKey) {
  return getCellContents(sheet, INFO_COLUMN_HEADERS.indexOf(infoKey), rowIndex);
}

// Helper to get the header of a given column
function getColumnHeader(sheet, columnIndex) {
  return getCellContents(sheet, columnIndex, 0);
}

// Helper to check whether a given column header represents a new survey response to be added
function checkIsNewSurveyResponse(columnHeader) {
  return columnHeader && columnHeader.startsWith('NEW');
}

// Helper to extract the content of a cell within a sheet, given the 0 based column and row indices
function getCellContents(sheet, columnIndex, rowIndex) {
  const cell = sheet[xlsx.utils.encode_cell({ c: columnIndex, r: rowIndex })];
  return cell === undefined ? '' : cell.v; // Extract the value of the cell if it wasn't blank
}

async function getSurveyFromSheet(models, sheet) {
  const firstSurveyResponseId = getColumnHeader(sheet, INFO_COLUMN_HEADERS.length);
  const errorMessage =
    'Each tab of the import file must have at least one previously submitted survey as the first entry';
  if (!firstSurveyResponseId) {
    throw new ImportValidationError(errorMessage);
  }

  const firstSurveyResponse = await models.surveyResponse.findById(firstSurveyResponseId);
  if (!firstSurveyResponse) {
    throw new ImportValidationError(errorMessage);
  }

  return models.survey.findById(firstSurveyResponse.survey_id);
}
