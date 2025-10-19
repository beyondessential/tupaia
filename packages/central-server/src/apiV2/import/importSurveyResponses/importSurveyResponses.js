import moment from 'moment';
import xlsx from 'xlsx';

import { AnswerModel, generateId } from '@tupaia/database';
import {
  constructIsOneOf,
  constructRecordExistsWithId,
  DatabaseError,
  getDateRangeForGranularity,
  hasContent,
  ImportValidationError,
  ObjectValidator,
  reduceToDictionary,
  respond,
  stripTimezoneFromDate,
  takesIdForm,
  UploadError,
} from '@tupaia/utils';
import { ANSWER_TYPES } from '../../../database/models/Answer';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import {
  EXPORT_DATE_FORMAT,
  INFO_COLUMN_HEADERS,
  INFO_ROW_HEADERS,
} from '../../export/exportSurveyResponses';
import { getArrayQueryParameter } from '../../utilities';
import { SurveyResponseUpdatePersistor } from './SurveyResponseUpdatePersistor';
import { assertCanImportSurveyResponses } from './assertCanImportSurveyResponses';
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
  [ANSWER_TYPES.USER]: async (models, answerValue) => {
    if (!answerValue) {
      return answerValue;
    }

    const userIdRegex = new RegExp(/(?<=\().+?(?=\))/);
    const userId = answerValue.match(userIdRegex)?.[0];

    if (!userId) {
      throw new Error(`Could not find user id in ${answerValue}`);
    }
    const user = await models.user.findById(userId);

    if (!user) {
      throw new Error(`Could not find user with id ${userId}`);
    }

    return user.id;
  },
};

const IMPORT_MODES = {
  DEFAULT: 'DEFAULT',

  // A new response will be created
  NEW: 'NEW',

  // Find the most recent response in the specified period and update it using the imported answers.
  // Fill any empty answers using the existing response
  UPDATE: 'UPDATE',

  // Same as 'UPDATE, but create a new response instead of updating the existing one
  MERGE: 'MERGE',
};

const IMPORT_BEHAVIOURS = {
  [IMPORT_MODES.DEFAULT]: {
    shouldGenerateIds: false,
    shouldUpdateExistingResponses: false,
    shouldDeleteEmptyAnswer: true,
    shouldFillEmptyAnswer: false,
  },
  [IMPORT_MODES.NEW]: {
    shouldGenerateIds: true,
    shouldUpdateExistingResponses: false,
    shouldDeleteEmptyAnswer: true,
    shouldFillEmptyAnswer: false,
  },
  [IMPORT_MODES.UPDATE]: {
    shouldGenerateIds: false,
    shouldUpdateExistingResponses: true,
    shouldDeleteEmptyAnswer: false,
    shouldFillEmptyAnswer: false,
  },
  [IMPORT_MODES.MERGE]: {
    shouldGenerateIds: true,
    shouldUpdateExistingResponses: false,
    shouldDeleteEmptyAnswer: false,
    shouldFillEmptyAnswer: true,
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

    const { timeZone } = query;
    if (!timeZone) {
      throw new Error(`Timezone is required`);
    }
    const updatePersistor = new SurveyResponseUpdatePersistor(models);

    const workbook = xlsx.readFile(req.file.path);
    const tabNames = Object.keys(workbook.Sheets);
    const querySurveyCodes = getArrayQueryParameter(query.surveyCodes);

    if (querySurveyCodes) {
      for (const querySurveyCode of querySurveyCodes) {
        if (!tabNames.includes(querySurveyCode)) {
          throw new ImportValidationError(
            `Survey with code ${querySurveyCode} specified in import but there is no tab named ${querySurveyCode} in the spreadsheet.`,
          );
        }
      }
    }

    const entitiesBySurveyCode = await getEntitiesBySurveyCode(models, workbook.Sheets);
    const entityCodes = Object.values(entitiesBySurveyCode).flat();
    const entities = await models.entity.find({ code: entityCodes });
    const entityCodeToId = reduceToDictionary(entities, 'code', 'id');

    const importSurveyResponsePermissionsChecker = async accessPolicy => {
      await assertCanImportSurveyResponses(accessPolicy, models, entitiesBySurveyCode);
    };

    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, importSurveyResponsePermissionsChecker]),
    );

    for (const surveySheets of Object.entries(workbook.Sheets)) {
      const [tabName, sheet] = surveySheets;

      if (querySurveyCodes && !querySurveyCodes.includes(tabName)) continue;

      const deletedResponseIds = new Set();
      const questionIds = [];
      const survey = await models.survey.findOne({ code: tabName });
      if (!survey) {
        throw new Error(`Tab name "${tabName}" does not match an existing survey code`);
      }

      // extract response ids and set up update batcher
      const { maxColumnIndex, maxRowIndex } = getMaxRowColumnIndex(sheet);
      const minSurveyResponseIndex = INFO_COLUMN_HEADERS.length;
      const surveyResponses = [];
      const isGeneratedIdByColumnIndex = [];
      const existingResponseDataByColumnIndex = [];

      const getExistingResponseData = async columnIndex => {
        if (!(columnIndex in existingResponseDataByColumnIndex)) {
          const criteria = {
            entityId: entityCodeToId[getInfoForColumn(sheet, columnIndex, 'Entity Code')],
            date: getDateStringForColumn(sheet, columnIndex),
          };
          const responseData = await findExistingResponseData(models, survey, criteria);
          existingResponseDataByColumnIndex[columnIndex] = responseData;
        }

        return existingResponseDataByColumnIndex[columnIndex];
      };

      for (let columnIndex = minSurveyResponseIndex; columnIndex <= maxColumnIndex; columnIndex++) {
        const columnHeader = getColumnHeader(sheet, columnIndex);
        const importMode = getImportMode(columnHeader);
        const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');
        const entityName = getInfoForColumn(sheet, columnIndex, 'Entity Name');
        const entity = await models.entity.findOne({ code: entityCode });

        if (entityCode && entityName) {
          if (!entity) {
            throw new ImportValidationError(
              `Entity code does match any existing entity: ${entityCode}`,
            );
          }

          if (entity.name !== entityName) {
            throw new ImportValidationError(
              `Entity code and name don't match: ${entity?.name} and ${entityName}`,
            );
          }
        }

        let surveyResponseIdValue = null;
        if (IMPORT_BEHAVIOURS[importMode].shouldGenerateIds) {
          surveyResponseIdValue = generateId();
          isGeneratedIdByColumnIndex[columnIndex] = true;
        } else if (IMPORT_BEHAVIOURS[importMode].shouldUpdateExistingResponses) {
          const { surveyResponseId } = await getExistingResponseData(columnIndex);

          if (surveyResponseId) {
            surveyResponseIdValue = surveyResponseId;
          } else {
            // A matching existing response was not found, generate a new id
            surveyResponseIdValue = generateId();
            isGeneratedIdByColumnIndex[columnIndex] = true;
          }
        } else {
          surveyResponseIdValue = columnHeader;
        }
        surveyResponses[columnIndex] = {
          surveyResponseId: surveyResponseIdValue,
          entityId: entity?.id,
        };
      }
      updatePersistor.setupColumnsForSheet(tabName, surveyResponses);

      for (let columnIndex = minSurveyResponseIndex; columnIndex <= maxColumnIndex; columnIndex++) {
        const columnHeader = getColumnHeader(sheet, columnIndex);
        validateColumnHeader(columnHeader, columnIndex, tabName);

        if (isGeneratedIdByColumnIndex[columnIndex]) {
          const { surveyResponseId } = surveyResponses[columnIndex];
          const surveyResponseDetails = await constructNewSurveyResponseDetails(
            models,
            sheet,
            columnIndex,
            { id: surveyResponseId, survey, timeZone, userId },
          );
          updatePersistor.createSurveyResponse(surveyResponseId, surveyResponseDetails);
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
          answerValidator = new ObjectValidator(
            {},
            AnswerModel.constructAnswerValidator(models, question),
          );
          answerTransformer = ANSWER_TRANSFORMERS[question.type];
        }

        const getAnswerText = async (answerValue, surveyResponseId, columnIndex, importMode) => {
          if (
            checkIsCellEmpty(answerValue) &&
            IMPORT_BEHAVIOURS[importMode].shouldFillEmptyAnswer
          ) {
            const { dataTime, answerTextsByQuestionId } =
              await getExistingResponseData(columnIndex);
            // Use data from an existing response to fill the empty answer
            return isDateAnswer(rowType) ? dataTime : answerTextsByQuestionId?.[questionId];
          }

          return isDateAnswer(rowType)
            ? getNewDataTimeIfRequired(models, surveyResponseId, answerValue)
            : answerValue;
        };

        for (
          let columnIndex = minSurveyResponseIndex;
          columnIndex <= maxColumnIndex;
          columnIndex++
        ) {
          const { surveyResponseId } = surveyResponses[columnIndex];
          const columnHeader = getColumnHeader(sheet, columnIndex);
          const importMode = getImportMode(columnHeader);
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
            } else if (
              checkIsCellEmpty(transformedAnswerValue) &&
              IMPORT_BEHAVIOURS[importMode].shouldDeleteEmptyAnswer
            ) {
              // Empty question row: delete any matching answer
              updatePersistor.deleteAnswer(surveyResponseId, { questionId });
            } else {
              const answerText = await getAnswerText(
                transformedAnswerValue.toString(),
                surveyResponseId,
                columnIndex,
                importMode,
              );

              if (!checkIsCellEmpty(answerText)) {
                if (isDateAnswer(rowType)) {
                  // Don't save an answer for date of data rows, instead update the date_time of the
                  // survey response. Note that this will override what is in the Date info row
                  updatePersistor.updateDataTime(surveyResponseId, answerText);
                } else {
                  // Normal question row with content: update or create an answer
                  updatePersistor.upsertAnswer(surveyResponseId, {
                    surveyResponseId,
                    questionId,
                    text: answerText,
                    type: rowType,
                  });
                }
              }
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

const findExistingResponseData = async (models, survey, criteria) => {
  const { entityId, date } = criteria;

  const surveyId = survey.id;

  const surveyResponse = await models.surveyResponse.findOne(
    {
      survey_id: surveyId,
      entity_id: entityId,
      data_time: getDataTimeCondition(date, survey.period_granularity),
    },
    { sort: ['end_time desc', 'id desc'] },
  );

  const answers = surveyResponse ? await surveyResponse.getAnswers() : [];

  return {
    dataTime: surveyResponse?.data_time,
    surveyResponseId: surveyResponse?.id,
    answerTextsByQuestionId: reduceToDictionary(answers, 'question_id', 'text'),
  };
};

const getDataTimeCondition = (date, periodGranularity) => {
  if (!periodGranularity) {
    return {
      comparator: '<=',
      comparisonValue: date,
    };
  }

  const { startDate, endDate } = getDateRangeForGranularity(date, periodGranularity);
  return {
    comparator: 'between',
    comparisonValue: [startDate, endDate],
  };
};

const constructNewSurveyResponseDetails = async (models, sheet, columnIndex, config) => {
  const { id, survey, userId, timeZone } = config;
  const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');
  const entity = await models.entity.findOne({ code: entityCode });
  if (!entity) {
    throw new Error(`No entity with code ${entityCode}`);
  }
  const user = await models.user.findById(userId);

  let approvalStatus = models.surveyResponse.approvalStatusTypes.NOT_REQUIRED;
  if (survey.requires_approval) {
    approvalStatus = models.surveyResponse.approvalStatusTypes.PENDING;
  }

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
    approval_status: approvalStatus,
  };
};

/**
 * Return all the entitites of the submitted survey responses, grouped by the survey code (sheet name) that the survey responses belong to
 * @param {*} models
 * @param {*} sheets
 */
const getEntitiesBySurveyCode = async (models, sheets) => {
  const entitiesGroupedBySurveyCode = {};

  for (const surveySheet of Object.entries(sheets)) {
    const [tabName, sheet] = surveySheet;
    const { maxColumnIndex } = getMaxRowColumnIndex(sheet);
    const surveyCode = tabName;

    for (let columnIndex = 0; columnIndex <= maxColumnIndex; columnIndex++) {
      const columnHeader = getColumnHeader(sheet, columnIndex);

      if (!isInfoColumn(columnIndex)) {
        const entityCode = getInfoForColumn(sheet, columnIndex, 'Entity Code');

        if (!entitiesGroupedBySurveyCode[surveyCode]) {
          entitiesGroupedBySurveyCode[surveyCode] = [];
        }

        entitiesGroupedBySurveyCode[surveyCode].push(entityCode);
      } else if (columnHeader !== INFO_COLUMN_HEADERS[columnIndex]) {
        throw new ImportValidationError(`Missing ${INFO_COLUMN_HEADERS[columnIndex]} column`);
      }
    }
  }

  return entitiesGroupedBySurveyCode;
};

const isInfoColumn = columnIndex => columnIndex < INFO_COLUMN_HEADERS.length;

const getMaxRowColumnIndex = sheet => {
  const maxCell = sheet['!ref'].split(':')[1]; // The range property of the sheet looks like "A1:E56"
  const { c: maxColumnIndex, r: maxRowIndex } = xlsx.utils.decode_cell(maxCell);
  return { maxColumnIndex, maxRowIndex };
};

const isDateAnswer = answerType =>
  answerType === ANSWER_TYPES.DATE_OF_DATA || answerType === ANSWER_TYPES.SUBMISSION_DATE;

async function getNewDataTimeIfRequired(models, surveyResponseId, newDataTime) {
  if (checkIsCellEmpty(newDataTime)) {
    return null;
  }

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

function getImportMode(columnHeader) {
  const importMode = Object.values(IMPORT_MODES).find(importMode =>
    columnHeader.startsWith(importMode),
  );
  return importMode || IMPORT_MODES.DEFAULT;
}

function validateColumnHeader(columnHeader, columnIndex, tabName) {
  const importMode = getImportMode(columnHeader);
  if (importMode !== IMPORT_MODES.DEFAULT) {
    // A special import mode is used as a header, header is valid
    return;
  }

  try {
    // Validate that every header takes id form, i.e. is an existing or deleted response
    hasContent(columnHeader);
    takesIdForm(columnHeader);
  } catch (error) {
    const importModeDescription = Object.values(IMPORT_MODES).map(mode => `"${mode}"`);
    const errorMessage = `Invalid column header ${columnHeader} causing message: ${
      error.message
    } at column ${
      columnIndex + 1
    } on tab ${tabName} (should be a survey response id or ${importModeDescription.join('/')})`;
    throw new ImportValidationError(errorMessage);
  }
}

// Helper to extract the content of a cell within a sheet, given the 0 based column and row indices
function getCellContents(sheet, columnIndex, rowIndex) {
  const cell = sheet[xlsx.utils.encode_cell({ c: columnIndex, r: rowIndex })];
  return cell === undefined ? '' : cell.v; // Extract the value of the cell if it wasn't blank
}
