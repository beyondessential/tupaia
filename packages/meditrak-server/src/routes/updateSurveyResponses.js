/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import {
  respond,
  DatabaseError,
  ImportValidationError,
  UploadError,
  ObjectValidator,
  hasContent,
  constructRecordExistsWithId,
  takesIdForm,
  constructIsOneOf,
} from '@tupaia/utils';
import { ANSWER_TYPES } from '../database/models/Answer';
import { constructAnswerValidator } from './utilities/constructAnswerValidator';
import { EXPORT_DATE_FORMAT, INFO_COLUMN_HEADERS, INFO_ROW_HEADERS } from './exportSurveyResponses';

/**
 * Updates existing survey responses by importing the new answers from an Excel file, and either
 * updating or creating each answer as appropriate
 */
export async function updateSurveyResponses(req, res) {
  try {
    if (!req.file) {
      throw new UploadError();
    }
    const { models } = req;
    await models.wrapInTransaction(async transactingModels => {
      const workbook = xlsx.readFile(req.file.path);
      // Go through each sheet in the workbook and process the updated survey responses
      const sheets = Object.values(workbook.Sheets);
      for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
        const sheet = sheets[sheetIndex];
        const tabName = Object.keys(workbook.Sheets)[sheetIndex];
        const deletedColumnHeaders = new Set();
        const questionIds = [];
        const newSurveyResponseIds = {};

        // Create new survey responses where required
        let firstSurveyResponseId;
        const maxCell = sheet['!ref'].split(':')[1]; // The range property of the sheet looks like "A1:E56"
        const { c: maxColumnIndex, r: maxRowIndex } = xlsx.utils.decode_cell(maxCell);
        for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex++) {
          const columnHeader = getColumnHeader(sheet, columnIndex);
          if (columnIndex < INFO_COLUMN_HEADERS.length) {
            // Just an info column, validate and move on
            if (columnHeader !== INFO_COLUMN_HEADERS[columnIndex]) {
              throw new ImportValidationError(`Missing ${INFO_COLUMN_HEADERS[columnIndex]} column`);
            }
          } else {
            // A column representing a survey response
            try {
              if (checkIsNewSurveyResponse(columnHeader)) {
                // Create a new survey response
                if (!firstSurveyResponseId) {
                  throw new Error(
                    'Each tab of the import file must have at least one previously submitted survey as the first entry',
                  );
                }
                const firstSurveyResponse = await transactingModels.surveyResponse.findById(
                  firstSurveyResponseId,
                );
                const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');
                const entity = await transactingModels.entity.findOne({ code: entityCode });

                const user = await transactingModels.user.findById(req.userId);
                const surveyDate = getDateForColumn(sheet, columnIndex);
                const newSurveyResponse = await transactingModels.surveyResponse.create({
                  survey_id: firstSurveyResponse.survey_id, // All survey responses within a sheet should be for the same survey
                  assessor_name: `${user.first_name} ${user.last_name}`,
                  user_id: user.id,
                  entity_id: entity.id,
                  start_time: surveyDate,
                  end_time: surveyDate,
                  submission_time: surveyDate,
                });
                newSurveyResponseIds[columnIndex] = newSurveyResponse.id;
              } else {
                // Validate that every header takes id form, i.e. is an existing or deleted response
                await hasContent(columnHeader);
                await takesIdForm(columnHeader);
                if (!firstSurveyResponseId) {
                  firstSurveyResponseId = columnHeader;
                }
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
      throw new DatabaseError('updating survey responses', error);
    }
  }
}

async function updateSubmissionTimeIfRequired(models, surveyResponseId, newSubmissionTimeString) {
  const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
  if (!surveyResponse) return; // Survey response is probably deleted
  const currentSubmissionTime = surveyResponse.submission_time;
  const isInExportFormat = moment(newSubmissionTimeString, EXPORT_DATE_FORMAT, true).isValid();
  const newSubmissionTimeWithTimezone = isInExportFormat
    ? momentTimezone.tz(newSubmissionTimeString, EXPORT_DATE_FORMAT, surveyResponse.timezone)
    : momentTimezone.tz(newSubmissionTimeString, surveyResponse.timezone);
  const newSubmissionTimeInUtc = newSubmissionTimeWithTimezone.utc().format();

  if (!moment(currentSubmissionTime).isSame(newSubmissionTimeInUtc, 'minute')) {
    await models.surveyResponse.updateById(surveyResponseId, {
      submission_time: newSubmissionTimeInUtc,
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
