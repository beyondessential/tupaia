import xlsx from 'xlsx';
import moment from 'moment';
import { uniq } from 'es-toolkit';
import { keyBy, chunk, groupBy } from 'es-toolkit/compat';
import {
  addExportedDateAndOriginAtTheSheetBottom,
  getExportDatesString,
  truncateString,
  toFilename,
} from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';
import { RECORDS } from '@tupaia/database';
import { ANSWER_TYPES, NON_DATA_ELEMENT_ANSWER_TYPES } from '../../../database/models/Answer';
import { findAnswersInSurveyResponse, findQuestionsInSurvey } from '../../../dataAccessors';
import { hasBESAdminAccess } from '../../../permissions';
import { zipMultipleFiles } from '../../utilities';

const FILE_PREFIX = 'survey_response_export';
const MAX_RESPONSES_PER_FILE = 10000; // exporting too many responses in one file ends up out of memory
export const EXPORT_DATE_FORMAT = 'D-M-YYYY h:mma';
export const API_DATE_FORMAT = 'YYYY-MM-DD';
const INFO_COLUMNS = {
  id: 'Id',
  type: 'Type',
  code: 'Code',
  text: 'Question',
};

function getEasyReadingInfoColumns(startDate, endDate) {
  return { text: `Survey responses ${getExportDatesString(startDate, endDate)}` };
}
export const INFO_COLUMN_HEADERS = Object.values(INFO_COLUMNS); // For importer to understand format
export const INFO_ROW_HEADERS = ['Entity Code', 'Entity Name', 'Date'];

const getBlankWorkbook = () => ({ SheetNames: [], Sheets: {} });

/**
 * Exports excel documents containing the relevant survey responses, splitting into multiple files
 * and zipping if too large.
 *
 * Note that this is a large function that is broken up into many internal helper functions, a bit
 * like a class. The main body of the function is right at the bottom.
 */
export async function exportResponsesToFile(
  models,
  userId,
  accessPolicy,
  {
    country,
    easyReadingMode,
    endDate,
    entities,
    latest,
    reportName,
    startDate,
    surveyResponse,
    surveys,
    timeZone,
    includeArchived = false,
  },
) {
  if (surveys.length === 0) {
    throw new Error('No surveys specified');
  }

  const exportDate = Date.now();
  const entitiesById = keyBy(entities, 'id');
  const infoColumns = easyReadingMode
    ? getEasyReadingInfoColumns(startDate, endDate)
    : INFO_COLUMNS;
  const infoColumnKeys = Object.keys(infoColumns);
  const infoColumnHeaders = Object.values(infoColumns);
  const files = [];
  let currentWorkbook = getBlankWorkbook();
  const firstSurveyName = surveys[0].name;

  const addDataToSheet = (surveyCode, exportData) => {
    const sheetName = surveyCode.substring(0, 31); // stay within excel limit on sheet name length
    currentWorkbook.Sheets[sheetName] = xlsx.utils.aoa_to_sheet(exportData);
    currentWorkbook.SheetNames.push(sheetName);
  };

  const saveCurrentWorkbook = () => {
    const fileNumber = files.length + 1;
    const prettyFileNumber = fileNumber === 1 ? '' : fileNumber;

    // If exporting a single survey, use human friendly name in filename
    const fileName =
      surveys.length === 1
        ? `${firstSurveyName} - Survey Responses${prettyFileNumber}`
        : `${FILE_PREFIX}_${exportDate}_${fileNumber}`;

    const filePath = `${getExportPathForUser(userId)}/${toFilename(fileName)}.xlsx`;

    xlsx.writeFile(currentWorkbook, filePath);
    files.push(filePath);
    currentWorkbook = getBlankWorkbook(); // reset current workbook
    return filePath;
  };

  // get a deep cloned base export to add data to, e.g. something like:
  // [
  //   ['Id', 'Type', 'Code', 'Question'],
  //   ['N/A', 'N/A', 'N/A', 'Entity Code'],
  //   ['N/A', 'N/A', 'N/A', 'Entity Name'],
  //   ['N/A', 'N/A', 'N/A', 'Date'],
  // ]
  const getBaseExport = () => [
    infoColumnHeaders.slice(), // deep clone
    ...INFO_ROW_HEADERS.map(rowHeader =>
      infoColumnHeaders.map((header, index) => {
        if (index < infoColumnHeaders.length - 1) return 'N/A';
        return rowHeader; // Only final info column should contain row headers
      }),
    ),
  ];

  const checkAccessToSurvey = async survey => {
    const permissionGroup = await survey.getPermissionGroup();
    // Skip checks if we have BES admin
    if (hasBESAdminAccess(accessPolicy)) {
      return true;
    }

    if (entities.length > 0) {
      // Check we have access for all entities
      return entities.every(entity =>
        accessPolicy.allows(entity.country_code, permissionGroup.name),
      );
    }
    // Check we have access to the singular country
    return accessPolicy.allows(country.code, permissionGroup.name);
  };

  const getDataTimeCondition = () => {
    if (startDate && endDate) {
      return {
        comparisonType: 'whereBetween',
        args: [
          [new Date(moment(startDate).startOf('day')), new Date(moment(endDate).endOf('day'))],
        ],
      };
    }
    if (startDate) {
      return {
        comparator: '>=',
        comparisonValue: new Date(moment(startDate).startOf('day')),
      };
    }
    if (endDate) {
      return {
        comparator: '<=',
        comparisonValue: new Date(moment(endDate).endOf('day')),
      };
    }
    return null;
  };

  const findResponsesForSurvey = async survey => {
    const surveyResponseFindConditions = {
      survey_id: survey.id,
    };

    if (includeArchived !== true && includeArchived !== 'true') {
      surveyResponseFindConditions.outdated = false; // only get the latest version of each survey response unless includeArchived === true. Outdated responses are usually resubmissions
    }

    const dataTimeCondition = getDataTimeCondition();
    if (dataTimeCondition) {
      surveyResponseFindConditions.data_time = dataTimeCondition;
    }

    const allEntityIds = entities.map(entity => entity.id);
    const sortAndLimitSurveyResponses =
      latest === 'true' ? { sort: ['data_time DESC'], limit: 1 } : { sort: ['data_time ASC'] };

    // to support a large number of entities (e.g. all schools in Laos), 'findManyByColumn' will
    // break the query into batches, using a subset of entities each time
    return models.surveyResponse.findManyByColumn(
      'entity_id',
      allEntityIds,
      surveyResponseFindConditions,
      sortAndLimitSurveyResponses,
    );
  };

  const getAnswerTextForExport = async answer => {
    if (answer === undefined) {
      return '';
    }
    if (answer.type === ANSWER_TYPES.ENTITY) {
      const entity = await models.entity.findById(answer.text);
      if (!entity) {
        return `Could not find entity with id ${answer.text}`;
      }
      return entity.code;
    }

    if (answer.type === ANSWER_TYPES.USER) {
      const user = await models.user.findById(answer.text);
      if (!user) {
        return `Could not find user with id ${answer.text}`;
      }
      return `${user.first_name} ${user.last_name} (${user.id})`;
    }
    return answer.text;
  };

  const getMetadataCellsForResponse = response => {
    const entity = entitiesById[response.entity_id];

    const idCell = easyReadingMode ? undefined : response.id;
    const entityCodeCell = entity.code;
    const responseNameCell = truncateString(entity.name, 30);
    const dateCell = moment(response.dataTime()).format(EXPORT_DATE_FORMAT);
    return [idCell, entityCodeCell, responseNameCell, dateCell];
  };

  const getExportDataForResponses = async (surveyResponses, survey, questions) => {
    const exportData = getBaseExport();

    // Set up metadata cells at the top of each survey response column
    surveyResponses.forEach((response, responseIndex) => {
      const metadataCells = getMetadataCellsForResponse(response);
      const exportColumn = infoColumnKeys.length + responseIndex;
      metadataCells.forEach((content, index) => {
        exportData[index][exportColumn] = content;
      });
    });

    // Fetch all answers of all survey responses
    const surveyResponseIds = surveyResponses.map(response => response.id);
    const answers = await findAnswersInSurveyResponse(
      models,
      surveyResponseIds,
      {},
      {
        columns: [{ [`${RECORDS.SURVEY_RESPONSE}.id`]: 'answer.survey_response_id' }],
        sort: [],
      },
    );

    // Add any questions that are in survey responses but no longer in the survey
    const allQuestionIds = uniq(answers.flatMap(a => a['question.id']));
    const validQuestionIds = questions.map(q => q.id);
    const outdatedQuestionIds = allQuestionIds.filter(id => !validQuestionIds.includes(id));
    const outdatedQuestions = await models.question.find({ id: outdatedQuestionIds });
    const allQuestions = [...questions, ...outdatedQuestions];

    // Add title
    if (reportName) {
      exportData.unshift([`${reportName} - ${survey.name}, ${country.name}`]);
    }

    // Exclude 'SubmissionDate'/'DateOfData' and 'PrimaryEntity' rows from survey response export since these have no answers
    const questionsForExport = allQuestions.filter(
      ({ type: questionType }) =>
        !NON_DATA_ELEMENT_ANSWER_TYPES.includes(questionType) ||
        questionType === ANSWER_TYPES.INSTRUCTION,
    );

    // Add the questions info and answers to be exported
    const preQuestionRowCount = exportData.length;

    // Set up the left columns with info about the questions
    questionsForExport.forEach((question, questionIndex) => {
      const questionInfo = infoColumnKeys.map(columnKey => question[columnKey]);
      const exportRow = preQuestionRowCount + questionIndex;
      exportData[exportRow] = questionInfo;
    });

    // Add the answers on the right columns to the exportData
    const questionIdToIndex = Object.fromEntries(
      questionsForExport.map((question, index) => [question.id, index]),
    );
    const responseIdToIndex = Object.fromEntries(
      surveyResponses.map((response, index) => [response.id, index]),
    );
    const answerTasks = answers
      .filter(answer => questionIdToIndex[answer['question.id']] !== undefined) // filter out answers for a non-exported question, e.g. DateOfData
      .map(async answer => {
        const surveyResponseIndex = responseIdToIndex[answer['survey_response.id']];
        const questionIndex = questionIdToIndex[answer['question.id']];
        const exportRow = preQuestionRowCount + questionIndex;
        const exportColumn = infoColumnKeys.length + surveyResponseIndex;
        exportData[exportRow][exportColumn] = await getAnswerTextForExport(answer);
      });
    await Promise.all(answerTasks);

    if (easyReadingMode) {
      return addExportedDateAndOriginAtTheSheetBottom(exportData, timeZone);
    }

    return exportData;
  };

  const addResponsesToSheet = async (surveyResponses, survey, questions) => {
    const exportData = await getExportDataForResponses(surveyResponses, survey, questions);
    addDataToSheet(survey.code, exportData);
  };

  /** Main body of the function below this point, everything above is helper functions */

  const surveysWithAccessStatus = await Promise.all(
    surveys.map(async s => ({ ...s, accessible: await checkAccessToSurvey(s) })),
  );
  const { true: surveysWithAccess = [], false: surveysWithoutAccess = [] } = groupBy(
    surveysWithAccessStatus,
    'accessible',
  );
  surveysWithoutAccess.forEach(survey => {
    const exportData = [[`You do not have export access to ${survey.name}`]];
    addDataToSheet(survey.code, exportData);
  });

  for (const survey of surveysWithAccess) {
    // Get the current set of questions, in the order they appear in the survey
    const questions = await findQuestionsInSurvey(models, survey.id);

    if (surveyResponse) {
      await addResponsesToSheet([surveyResponse], survey, questions);
    } else {
      const surveyResponses = await findResponsesForSurvey(survey);
      const responseBatches = chunk(surveyResponses, MAX_RESPONSES_PER_FILE);
      if (responseBatches.length > 1) {
        let batchNumber = 1;
        for (const batchOfResponses of responseBatches) {
          await addResponsesToSheet(batchOfResponses, survey, questions);
          saveCurrentWorkbook(batchNumber);
          batchNumber++;
        }
      } else {
        await addResponsesToSheet(surveyResponses, survey, questions);
      }
    }
  }

  // Note: in the typical case of a single survey with normal amount of responses, files.length will be 0 at this point
  if (files.length === 0) {
    return saveCurrentWorkbook();
  }

  const exportFilePath = `${getExportPathForUser(userId)}/tupaia_export_${Date.now()}.zip`;
  return zipMultipleFiles(exportFilePath, files);
}
