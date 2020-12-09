/**
 * Tupaia MediTrak
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';
import moment from 'moment';
import fs from 'fs';
import { truncateString } from 'sussol-utilities';
import { DatabaseError, addExportedDateAndOriginAtTheSheetBottom } from '@tupaia/utils';
import { ANSWER_TYPES, NON_DATA_ELEMENT_ANSWER_TYPES } from '../database/models/Answer';
import { findAnswersInSurveyResponse, findQuestionsInSurvey } from '../dataAccessors';
import { SurveyResponseVariablesExtractor } from './utilities';

const FILE_LOCATION = 'exports';
const FILE_PREFIX = 'survey_response_export';
export const EXPORT_DATE_FORMAT = 'D-M-YYYY h:mma';
export const API_DATE_FORMAT = 'YYYY-MM-DD';
const INFO_COLUMNS = {
  id: 'Id',
  type: 'Type',
  code: 'Code',
  text: 'Question',
};
function getExportDatesString(startDate, endDate) {
  const format = 'D-M-YY';
  const momentFormat = date => moment(date).format(format);

  if (startDate && endDate)
    return `between ${momentFormat(startDate)} and ${momentFormat(endDate)} `;
  if (startDate) return `after ${momentFormat(startDate)} `;
  if (endDate) return `before ${momentFormat(endDate)} `;
  return '(no period specified)';
}
function getEasyReadingInfoColumns(startDate, endDate) {
  return { text: `Survey responses ${getExportDatesString(startDate, endDate)}` };
}
export const INFO_COLUMN_HEADERS = Object.values(INFO_COLUMNS); // For importer to understand format
export const INFO_ROW_HEADERS = ['Entity Code', 'Entity Name', 'Date'];
const getValuesForRowHeader = (rowHeader, infoColumnHeaders) =>
  infoColumnHeaders.map((header, index) => {
    if (index < infoColumnHeaders.length - 1) return 'N/A';
    return rowHeader; // Only final info column should contain row headers
  });
const getBaseExport = infoColumnHeaders => [
  infoColumnHeaders,
  ...INFO_ROW_HEADERS.map(rowHeader => getValuesForRowHeader(rowHeader, infoColumnHeaders)),
];

/**
 * Responds to GET requests to the /export/surveyResponses endpoint, exporting an excel document
 * containing the relevant survey responses
 * @param {object}  req - request info (e.g. url, query parameters, body)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function exportSurveyResponses(req, res) {
  const { models, accessPolicy } = req;
  const { surveyResponseId } = req.params;
  const {
    surveyCodes,
    entityIds,
    entityCode,
    countryCode,
    latest = false,
    startDate,
    endDate,
    timeZone = 'UTC',
    reportName,
    easyReadingMode = false,
  } = req.query;
  let { surveyId, countryId } = req.query;
  const infoColumns = easyReadingMode
    ? getEasyReadingInfoColumns(startDate, endDate)
    : INFO_COLUMNS;
  const infoColumnKeys = Object.keys(infoColumns);
  const infoColumnHeaders = Object.values(infoColumns);

  // Create empty workbook to contain survey response export
  const workbook = { SheetNames: [], Sheets: {} };

  try {
    const variablesExtractor = new SurveyResponseVariablesExtractor(models);
    const variables = await variablesExtractor.getParametersFromInput(
      countryCode,
      entityCode,
      countryId,
      entityIds,
      surveyResponseId,
    );
    const { country, entities, surveyResponse } = variables;
    countryId = variables.countryId || country.id || countryId;
    surveyId = variables.surveyId || surveyId;

    const surveys = await variablesExtractor.getSurveys(surveyId, surveyCodes, countryId);

    const sortAndLimitSurveyResponses =
      latest === 'true' ? { sort: ['end_time DESC'], limit: 1 } : { sort: ['end_time ASC'] };

    const addDataToSheet = (surveyName, exportData) => {
      const sheetName = truncateString(surveyName, 31);
      workbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(exportData);
      workbook.SheetNames.push(sheetName);
    };
    for (let surveyIndex = 0; surveyIndex < surveys.length; surveyIndex++) {
      const currentSurvey = surveys[surveyIndex];
      const permissionGroup = await currentSurvey.getPermissionGroup();
      const hasSurveyAccess = accessPolicy.allows(country.code, permissionGroup.name);
      if (!hasSurveyAccess) {
        const exportData = [[`You do not have export access to ${currentSurvey.name}`]];
        addDataToSheet(currentSurvey.name, exportData);
        continue;
      }
      let exportData = getBaseExport(infoColumnHeaders).map(innerArray => innerArray.slice());
      const surveyResponseAnswers = [];
      const processSurveyResponse = async (currentSurveyResponse, currentEntity) => {
        const surveyDate = currentSurveyResponse.timezoneAwareSubmissionTime();
        const responseName = truncateString(currentEntity.name, 30);
        const dateString = moment(surveyDate).format(EXPORT_DATE_FORMAT);
        if (!easyReadingMode) exportData[0].push(currentSurveyResponse.id);
        exportData[1].push(currentEntity.code);
        exportData[2].push(responseName);
        exportData[3].push(dateString);
        const answers = await findAnswersInSurveyResponse(models, currentSurveyResponse.id);
        const answersByQuestionId = {};
        answers.forEach(({ 'question.id': questionId, text }) => {
          answersByQuestionId[questionId] = text;
        });
        surveyResponseAnswers.push(answersByQuestionId);
      };

      if (surveyResponse) {
        const entity = await models.entity.findById(surveyResponse.entity_id);
        await processSurveyResponse(surveyResponse, entity);
      } else {
        for (let entityIndex = 0; entityIndex < entities.length; entityIndex++) {
          const entity = entities[entityIndex];
          const surveyResponseFindConditions = {
            survey_id: currentSurvey.id,
            entity_id: entity.id,
          };
          if (startDate && endDate) {
            surveyResponseFindConditions.submission_time = {
              comparisonType: 'whereBetween',
              args: [
                [
                  new Date(moment(startDate).subtract(1, 'day')),
                  new Date(moment(endDate).add(1, 'day')),
                ],
              ],
            };
          } else if (startDate) {
            surveyResponseFindConditions.submission_time = {
              comparator: '>=',
              comparisonValue: new Date(startDate),
            };
          } else if (endDate) {
            surveyResponseFindConditions.submission_time = {
              comparator: '<=',
              comparisonValue: new Date(endDate),
            };
          }
          const surveyResponses = await models.surveyResponse.find(
            surveyResponseFindConditions,
            sortAndLimitSurveyResponses,
          );

          for (
            let surveyResponseIndex = 0;
            surveyResponseIndex < surveyResponses.length;
            surveyResponseIndex++
          ) {
            await processSurveyResponse(surveyResponses[surveyResponseIndex], entity);
          }
        }
      }

      // Get the current set of questions, in the order they appear in the survey
      const questions = await findQuestionsInSurvey(models, currentSurvey.id);

      // Add any questions that are in survey responses but no longer in the survey
      const questionIdsSeen = {};
      questions.forEach(({ id: questionId }) => {
        questionIdsSeen[questionId] = true;
      });
      for (const answersByQuestionId of surveyResponseAnswers) {
        const extraQuestions = await Promise.all(
          Object.keys(answersByQuestionId)
            .filter(questionId => !questionIdsSeen[questionId])
            .map(async questionId => {
              const question = await models.question.findById(questionId);
              questionIdsSeen[questionId] = true;
              return question;
            }),
        );
        questions.push(...extraQuestions);
      }

      // If there is no data, add a message at the top
      if (surveyResponseAnswers.length === 0) {
        exportData.unshift([
          `No survey responses for ${currentSurvey.name} ${getExportDatesString(
            startDate,
            endDate,
          )}`,
        ]);
      }

      // Add title
      if (reportName) {
        exportData.unshift([`${reportName} - ${currentSurvey.name}, ${country.name}`]);
      }

      // Exclude 'SubmissionDate' and 'PrimaryEntity' rows from survey response export since these have no answers
      const questionsForExport = questions.filter(
        ({ type: questionType }) =>
          !NON_DATA_ELEMENT_ANSWER_TYPES.includes(questionType) ||
          questionType === ANSWER_TYPES.INSTRUCTION,
      );

      // Add the questions info and answers to be exported
      const preQuestionRowCount = INFO_ROW_HEADERS.length + 1; // Add one to make up for header row

      // Set up the left columns with info about the questions
      questionsForExport.forEach((question, questionIndex) => {
        const questionInfo = infoColumnKeys.map(columnKey => question[columnKey]);
        const exportRow = preQuestionRowCount + questionIndex;
        exportData[exportRow] = questionInfo;
      });

      // Add the answers on the right columns to the exportData
      questionsForExport.forEach((question, questionIndex) => {
        const exportRow = preQuestionRowCount + questionIndex;
        surveyResponseAnswers.forEach((answersByQuestionId, surveyResponseIndex) => {
          const answer = answersByQuestionId[question.id];
          const exportColumn = infoColumnKeys.length + surveyResponseIndex;
          exportData[exportRow][exportColumn] = answer || '';
        });
      });

      // Add export date and origin
      if (easyReadingMode)
        exportData = addExportedDateAndOriginAtTheSheetBottom(exportData, timeZone);

      addDataToSheet(currentSurvey.name, exportData);
    }
  } catch (error) {
    throw new DatabaseError('exporting survey responses', error);
  }

  // Make the export directory if it doesn't already exist
  try {
    fs.statSync(FILE_LOCATION);
  } catch (e) {
    fs.mkdirSync(FILE_LOCATION);
  }

  const filePath = `${FILE_LOCATION}/${FILE_PREFIX}_${Date.now()}.xlsx`;

  xlsx.writeFile(workbook, filePath);
  res.download(filePath);
}
