/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import moment from 'moment';
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
} from '@tupaia/utils';
import { getArrayQueryParameter, extractTabNameFromQuery } from '../utilities';
import { ANSWER_TYPES } from '../../database/models/Answer';
import { constructAnswerValidator } from '../utilities/constructAnswerValidator';
import {
  EXPORT_DATE_FORMAT,
  INFO_COLUMN_HEADERS,
  INFO_ROW_HEADERS,
} from '../exportSurveyResponses';
import { assertCanImportSurveyResponses } from './assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

// used to strip the tz suffix so that a date can be added to the database without converting to utc
// we don't want any timezone conversions when working with data_time
const ISO_DATE_FORMAT_WITHOUT_TZ = 'YYYY-MM-DDTHH:mm:ss.SSS';

/**
 * Creates or updates survey responses by importing the new answers from an Excel file, and either
 * updating or creating each answer as appropriate
 */
export async function importSurveyResponses(req, res) {
  try {
    if (!req.file) {
      throw new UploadError();
    }
    const surveyNames = getArrayQueryParameter(req?.query?.surveyNames);
    const { models } = req;
    await models.wrapInTransaction(async transactingModels => {
      const workbook = xlsx.readFile(req.file.path);
      // Go through each sheet in the workbook and process the updated survey responses
      const entitiesBySurveyName = await getEntitiesBySurveyName(
        transactingModels,
        workbook.Sheets,
        surveyNames,
      );

      const importSurveyResponsePermissionsChecker = async accessPolicy => {
        await assertCanImportSurveyResponses(accessPolicy, transactingModels, entitiesBySurveyName);
      };

      await req.assertPermissions(
        assertAnyPermissions([assertBESAdminAccess, importSurveyResponsePermissionsChecker]),
      );

      for (const surveySheets of Object.entries(workbook.Sheets)) {
        const [tabName, sheet] = surveySheets;
        const deletedColumnHeaders = new Set();
        const questionIds = [];
        const newSurveyResponseIds = {};

        // Create new survey responses where required
        const { maxColumnIndex, maxRowIndex } = getMaxRowColumnIndex(sheet);

        for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex++) {
          const columnHeader = getColumnHeader(sheet, columnIndex);
          if (!isInfoColumn(columnIndex)) {
            // A column representing a survey response
            try {
              if (checkIsNewSurveyResponse(columnHeader)) {
                if (!surveyNames) {
                  throw new Error(
                    'When importing new survey responses, you must specify the names of the surveys they are for',
                  );
                }
                const surveyName = extractTabNameFromQuery(tabName, surveyNames);
                const survey = await transactingModels.survey.findOne({ name: surveyName });
                const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');
                const entity = await transactingModels.entity.findOne({ code: entityCode });
                const user = await transactingModels.user.findById(req.userId);
                const surveyDate = getDateForColumn(sheet, columnIndex);
                const newSurveyResponse = await transactingModels.surveyResponse.create({
                  survey_id: survey.id, // All survey responses within a sheet should be for the same survey
                  assessor_name: `${user.first_name} ${user.last_name}`,
                  user_id: user.id,
                  entity_id: entity.id,
                  start_time: surveyDate,
                  end_time: surveyDate,
                  data_time: moment(surveyDate).format(ISO_DATE_FORMAT_WITHOUT_TZ),
                });
                newSurveyResponseIds[columnIndex] = newSurveyResponse.id;
              } else {
                // Validate that every header takes id form, i.e. is an existing or deleted response
                await hasContent(columnHeader);
                await takesIdForm(columnHeader);
              }
            } catch (error) {
              throw new ImportValidationError(
                `Invalid survey response id ${columnHeader} causing message: ${
                  error.message
                } at column ${columnIndex + 1} on tab ${tabName}`,
              );
            }
          }
        }

        const infoValidator = new ObjectValidator(constructInfoColumnValidators(transactingModels));
        const ignoredRowTypes = [ANSWER_TYPES.INSTRUCTION, ANSWER_TYPES.PRIMARY_ENTITY];
        for (let rowIndex = 1; rowIndex <= maxRowIndex; rowIndex++) {
          const excelRowNumber = rowIndex + 1; // +1 to make up for header
          const rowType = getInfoForRow(sheet, rowIndex, 'Type');
          if (ignoredRowTypes.includes(rowType)) {
            continue;
          }

          // Validate every cell in rows other than the header rows
          let answerValidator;
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
            const question = await transactingModels.question.findById(questionId);
            answerValidator = new ObjectValidator({}, constructAnswerValidator(models, question));
          }

          for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex++) {
            const columnHeader = getColumnHeader(sheet, columnIndex);
            const cellValue = getCellContents(sheet, columnIndex, rowIndex);
            // If we already deleted this survey response wholesale, no need to check specific rows
            if (
              columnHeader &&
              columnIndex !== '' &&
              !deletedColumnHeaders.has(columnHeader) &&
              !INFO_COLUMN_HEADERS.includes(columnHeader)
            ) {
              if (answerValidator) {
                const constructImportValidationError = message =>
                  new ImportValidationError(message, excelRowNumber, columnHeader, tabName);
                await answerValidator.validate(
                  { answer: cellValue },
                  constructImportValidationError,
                );
              }
              const surveyResponseId = checkIsNewSurveyResponse(columnHeader)
                ? newSurveyResponseIds[columnIndex]
                : columnHeader;
              if (!surveyResponseId || surveyResponseId === '') {
                throw new ImportValidationError('Missing survey response id', excelRowNumber);
              }
              if (questionId === 'N/A') {
                // Info row (e.g. entity name): if no content delete the survey response wholesale
                if (checkIsCellEmpty(cellValue)) {
                  await transactingModels.surveyResponse.deleteById(surveyResponseId);
                  deletedColumnHeaders.add(columnHeader);
                } else {
                  // Not deleting, make sure the submission date is set as defined in the spreadsheet
                  // TODO need to only update if the date has actually changed
                  const newSubmissionTime = getDateStringForColumn(sheet, columnIndex);
                  await updateSubmissionTimeIfRequired(
                    transactingModels,
                    surveyResponseId,
                    newSubmissionTime,
                  );
                }
              } else if (checkIsCellEmpty(cellValue)) {
                // Empty question row: delete any matching answer
                await transactingModels.answer.delete({
                  survey_response_id: surveyResponseId,
                  question_id: questionId,
                });
              } else if (rowType === ANSWER_TYPES.SUBMISSION_DATE) {
                // Don't save an answer for submission date rows, instead update the submission date
                // of the survey response. Note that this will override what is in the Date info row
                await updateSubmissionTimeIfRequired(
                  transactingModels,
                  surveyResponseId,
                  cellValue.toString(),
                );
              } else {
                // Normal question row with content: update or create an answer
                await transactingModels.answer.updateOrCreate(
                  { survey_response_id: surveyResponseId, question_id: questionId },
                  { text: cellValue.toString(), type: rowType },
                );
              }
            }
          }
        }
      }
    });
    respond(res, { message: 'Imported survey responses' });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    } else {
      throw new DatabaseError('Import survey responses', error);
    }
  }
}

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

async function updateSubmissionTimeIfRequired(models, surveyResponseId, newSubmissionTimeString) {
  const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
  if (!surveyResponse) return; // Survey response is probably deleted
  const currentDataTime = surveyResponse.data_time;
  const isInExportFormat = moment(newSubmissionTimeString, EXPORT_DATE_FORMAT, true).isValid();
  const newDataTime = isInExportFormat
    ? moment(newSubmissionTimeString, EXPORT_DATE_FORMAT)
    : moment(newSubmissionTimeString);

  if (!moment(currentDataTime).isSame(newDataTime, 'minute')) {
    await models.surveyResponse.updateById(surveyResponseId, {
      data_time: newDataTime.format(ISO_DATE_FORMAT_WITHOUT_TZ),
    });
  }
}

function getDateStringForColumn(sheet, columnIndex) {
  return getInfoForColumn(sheet, columnIndex, 'Date');
}

function getDateForColumn(sheet, columnIndex) {
  const dateString = getDateStringForColumn(sheet, columnIndex);
  return moment.utc(dateString, EXPORT_DATE_FORMAT).toDate();
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
