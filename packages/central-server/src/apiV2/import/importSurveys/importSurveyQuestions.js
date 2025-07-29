import xlsx from 'xlsx';
import { isEqual } from 'es-toolkit/compat';
import {
  DatabaseError,
  UploadError,
  ImportValidationError,
  ObjectValidator,
  MultiValidationError,
} from '@tupaia/utils';
import { deleteScreensForSurvey, deleteOrphanQuestions } from '../../../dataAccessors';
import { ANSWER_TYPES, NON_DATA_ELEMENT_ANSWER_TYPES } from '../../../database/models/Answer';
import { splitStringOnComma, splitOnNewLinesOrCommas } from '../../utilities';
import { ConfigImporter } from './ConfigImporter';
import { constructQuestionValidators } from './constructQuestionValidators';
import {
  processSurveyMetadataRow,
  validateSurveyMetadataRow,
  SURVEY_METADATA,
} from './processSurveyMetadata';
import { caseAndSpaceInsensitiveEquals, convertCellToJson } from './utilities';

const QUESTION_TYPE_LIST = Object.values(ANSWER_TYPES);
const VIS_CRITERIA_CONJUNCTION = '_conjunction';

const objectsAreEqual = (a, b) => {
  // If one is falsy and the other is truthy, they are not equal
  if (!!a !== !!b) return false;
  return isEqual(a, b);
};

const validateQuestionExistence = rows => {
  const isQuestionRow = ({ type }) => QUESTION_TYPE_LIST.includes(type);
  if (!rows || !rows.some(isQuestionRow)) {
    throw new ImportValidationError('No questions listed in import file');
  }
  return true;
};

/**
 *
 * @param {object} models
 * @param {string} screenId
 * @param {string} questionId
 * @param {number} componentNumber
 * @param {object} questionObject
 *
 * @returns {Promise<void>}
 *
 * @description Checks if the screen component already exists, if it does, it updates the changed values, otherwise it creates a new one
 */
const updateOrCreateSurveyScreenComponent = async (
  models,
  screenId,
  questionId,
  componentNumber,
  questionObject,
) => {
  const existingScreenComponent = await models.surveyScreenComponent.findOne({
    screen_id: screenId,
    question_id: questionId,
    component_number: componentNumber,
  });
  const {
    questionLabel = null,
    detailLabel = null,
    visibilityCriteria = null,
    validationCriteria = null,
    type,
  } = questionObject;

  const validationCriteriaObject = convertCellToJson(
    validationCriteria,
    processValidationCriteriaValue,
  );
  // Create a new survey screen component to display this question
  const visibilityCriteriaObject = convertCellToJson(visibilityCriteria, splitStringOnComma);

  const processedVisibilityCriteria = {};

  await Promise.all(
    Object.entries(visibilityCriteriaObject).map(async ([questionCode, answers]) => {
      if (questionCode === VIS_CRITERIA_CONJUNCTION) {
        // This is the special _conjunction key, extract the 'and' or the 'or' from answers,
        // i.e. { conjunction: ['and'] } -> { conjunction: 'and' }
        const [conjunctionType] = answers;
        processedVisibilityCriteria[VIS_CRITERIA_CONJUNCTION] = conjunctionType;
      } else if (questionCode === 'hidden') {
        processedVisibilityCriteria.hidden = answers[0] === 'true';
      } else {
        const relatedQuestion = await models.question.findOne({
          code: questionCode,
        });
        if (!relatedQuestion) {
          throw new ImportValidationError(
            `Question with code ${questionCode} does not exist`,
            excelRowNumber,
            'visibilityCriteria',
            tabName,
          );
        }
        const { id: questionId } = relatedQuestion;
        processedVisibilityCriteria[questionId] = answers;
      }
    }),
  );

  // If the question is a task, set it to hidden always
  if (type === ANSWER_TYPES.TASK && !processedVisibilityCriteria.hidden) {
    processedVisibilityCriteria.hidden = true;
  }

  // If the screen component already exists, update only the changed values, otherwise create a new one
  if (existingScreenComponent) {
    const changes = {};
    if (
      !objectsAreEqual(
        existingScreenComponent.visibility_criteria
          ? JSON.parse(existingScreenComponent.visibility_criteria)
          : {},
        processedVisibilityCriteria,
      )
    ) {
      changes.visibility_criteria = JSON.stringify(processedVisibilityCriteria);
    }

    if (
      !objectsAreEqual(
        existingScreenComponent.validation_criteria
          ? JSON.parse(existingScreenComponent.validation_criteria)
          : {},
        validationCriteriaObject,
      )
    ) {
      changes.validation_criteria = JSON.stringify(validationCriteriaObject);
    }

    if (questionLabel !== existingScreenComponent.question_label) {
      changes.question_label = questionLabel;
    }

    if (detailLabel !== existingScreenComponent.detail_label) {
      changes.detail_label = detailLabel;
    }

    if (Object.keys(changes).length > 0) {
      await models.surveyScreenComponent.update({ id: existingScreenComponent.id }, changes);
    }
    return existingScreenComponent;
  }
  const newSurveyScreenComponent = await models.surveyScreenComponent.create({
    screen_id: screenId,
    question_id: questionId,
    component_number: componentNumber,
    visibility_criteria: JSON.stringify(processedVisibilityCriteria),
    validation_criteria: JSON.stringify(validationCriteriaObject),
    question_label: questionLabel,
    detail_label: detailLabel,
  });

  return newSurveyScreenComponent;
};

const updateOrCreateDataElementInGroup = async (
  models,
  dataElementCode,
  dataGroup,
  surveyPermissionGroup,
) => {
  let dataElement = await models.dataElement.findOne({ code: dataElementCode });

  if (dataElement === null) {
    // Data Element doesn't exist, create it with the same service type and config as the data group
    dataElement = await models.dataElement.create({
      code: dataElementCode,
      service_type: dataGroup.service_type, // set this to be the same as the data group so that when the data element goes through updateDataElementsConfig() it gets the correct config. If we always set it to Tupaia here, then it won't update because Tupaia data elements can be in either DHIS or Tupaia data groups
      config: dataGroup.config, // set this to be the same as the data group so that when the data element goes through updateDataElementsConfig() it gets the correct config
      permission_groups: [surveyPermissionGroup.name], // Use the permission group of the survey as the default for the data element
    });

    await models.dataElementDataGroup.findOrCreate({
      data_element_id: dataElement.id,
      data_group_id: dataGroup.id,
    });
  } else {
    // dataElement already exists, don't overwrite it
    await models.dataElementDataGroup.findOrCreate({
      data_element_id: dataElement.id,
      data_group_id: dataGroup.id,
    });
  }

  return dataElement;
};

/**
 * Assumes user has permission to update survey questions for the given survey
 * @param models
 * @param {File} file
 * @param {Survey} survey
 * @param {DataGroup} dataGroup
 * @param {PermissionGroup} permissionGroup
 * @return {Promise<void>}
 */
export async function importSurveysQuestions({ models, file, survey, dataGroup, permissionGroup }) {
  if (!file) {
    throw new UploadError();
  }
  if (!survey) {
    throw new DatabaseError(`Survey required`);
  }

  const workbook = xlsx.readFile(file.path);

  if (Object.keys(workbook.Sheets).length !== 1) {
    throw new ImportValidationError('Questions spreadsheet must have exactly one tab');
  }
  const [firstTab] = Object.entries(workbook.Sheets);
  const [tabName, sheet] = firstTab;

  // Clear all existing data element/data group associations
  // We will re-create the ones required by the survey while processing its questions
  await models.dataElementDataGroup.delete({ data_group_id: dataGroup.id });

  // Refresh SurveyDate element
  await dataGroup.deleteSurveyDateElement();
  await dataGroup.upsertSurveyDateElement();

  const rows = xlsx.utils.sheet_to_json(sheet);
  validateQuestionExistence(rows);

  const questions = await survey.questions();

  // If the questions have changed order or had questions added/removed, delete all screens from the survey and re-create them
  if (rows.map(({ code }) => code).join(',') !== questions.map(({ code }) => code).join(',')) {
    await deleteScreensForSurvey(models, survey.id);
  }

  // Add all questions to the survey, creating screens, components and questions as required
  let currentScreen;
  let currentSurveyScreenComponent;
  let hasSeenDateOfDataQuestion = false;
  const errors = []; // An array to hold all errors, allowing multiple errors to be thrown at once
  const questionCodes = []; // An array to hold all question codes, allowing duplicate checking
  const configImporter = new ConfigImporter(models, rows);
  const objectValidator = new ObjectValidator(constructQuestionValidators(models));
  let hasPrimaryEntityQuestion = false;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    // Validate rows
    try {
      const row = rows[rowIndex];

      const questionObject = row;
      const excelRowNumber = rowIndex + 2; // +2 to make up for header and 0 index

      const constructImportValidationError = (message, field, { details }) => {
        return new ImportValidationError(message, excelRowNumber, field, undefined, details);
      };

      if (row.type === SURVEY_METADATA) {
        await validateSurveyMetadataRow(rows, rowIndex, constructImportValidationError);
        await processSurveyMetadataRow(models, rows, rowIndex, survey.id);
        continue;
      }

      await objectValidator.validate(questionObject, constructImportValidationError);

      // Validate no duplicate codes
      if (
        questionObject.code &&
        questionObject.code.length > 0 &&
        questionCodes.includes(questionObject.code)
      ) {
        throw new ImportValidationError('Question code is not unique', excelRowNumber);
      }
      // Validate no second primary entity question
      if (questionObject.type === ANSWER_TYPES.PRIMARY_ENTITY) {
        if (hasPrimaryEntityQuestion) {
          throw new ImportValidationError(
            `Only one ${ANSWER_TYPES.PRIMARY_ENTITY} question allowed`,
            excelRowNumber,
          );
        }
        hasPrimaryEntityQuestion = true;
      }
      questionCodes.push(questionObject.code);

      // Validate max one date of data/submission date question
      if (questionObject.type === 'DateOfData' || questionObject.type === 'SubmissionDate') {
        if (hasSeenDateOfDataQuestion) {
          // Previously had another submission date question
          throw new ImportValidationError(
            'Only one DateOfData/SubmissionDate question allowed',
            excelRowNumber,
          );
        }
        hasSeenDateOfDataQuestion = true;
      }

      // Extract question details from spreadsheet row
      const {
        code,
        type,
        name,
        text,
        detail,
        options,
        optionLabels,
        optionColors,
        newScreen,
        optionSet,
        hook,
      } = questionObject;

      let dataElement;
      if (!NON_DATA_ELEMENT_ANSWER_TYPES.includes(type)) {
        dataElement = await updateOrCreateDataElementInGroup(
          models,
          code,
          dataGroup,
          permissionGroup,
        );
      }

      // Compose question based on details from spreadsheet
      const questionToUpsert = {
        code,
        type,
        name,
        text,
        detail,
        hook,
        options: processOptions(options, optionLabels, optionColors, type),
        option_set_id: await processOptionSetName(models, optionSet, excelRowNumber, tabName),
        data_element_id: dataElement && dataElement.id,
      };

      // Either create or update the question depending on if there exists a matching code
      let question;
      if (code) {
        question = await models.question.updateOrCreate({ code }, questionToUpsert);
      } else {
        // No code in spreadsheet, can't match so just create a new question
        question = await models.question.create(questionToUpsert);
      }

      // Generate the screen and screen component
      const shouldStartNewScreen = caseAndSpaceInsensitiveEquals(newScreen, 'yes');
      if (!currentScreen || shouldStartNewScreen) {
        // Spreadsheet indicates this question starts a new screen
        // Create a new survey screen
        const params = {
          survey_id: survey.id,
          screen_number: currentScreen ? currentScreen.screen_number + 1 : 1, // Next screen
        };
        const existingScreen = await models.surveyScreen.findOne(params);
        if (existingScreen) {
          currentScreen = existingScreen;
        } else {
          currentScreen = await models.surveyScreen.create(params);
        }
        // Clear existing survey screen component
        currentSurveyScreenComponent = undefined;
      }

      const componentNumber = currentSurveyScreenComponent
        ? currentSurveyScreenComponent.component_number + 1
        : 1;
      currentSurveyScreenComponent = await updateOrCreateSurveyScreenComponent(
        models,
        currentScreen.id,
        question.id,
        componentNumber,
        questionObject,
      );
      const componentId = currentSurveyScreenComponent.id;
      await configImporter.add(rowIndex, componentId, constructImportValidationError);
    } catch (e) {
      errors.push(e);
      continue;
    }
  }

  if (errors.length > 0) {
    throw new MultiValidationError(
      'Errors occurred while importing questions',
      errors.map(({ message, extraFields }) => ({
        message,
        extraFields,
      })),
    );
  }

  await configImporter.import();

  // Clear  any orphaned questions (i.e. questions no longer included in a survey)
  await deleteOrphanQuestions(models);
}

async function processOptionSetName(models, name, excelRowNumber, tabName) {
  // TODO: Figure out why undefined value is returning all results.
  if (name) {
    const optionSet = await models.optionSet.findOne({ name });
    if (!optionSet) {
      const message = 'The Option Set listed does not exist.';
      throw new ImportValidationError(message, excelRowNumber, 'optionSet', tabName);
    }
    return optionSet.id;
  }
  return null;
}

const processOptionValues = (optionValuesString, type) => {
  switch (type) {
    case 'Binary':
      return ['Yes', 'No'];
    default:
      return splitOnNewLinesOrCommas(optionValuesString);
  }
};

function processOptions(optionValuesString, optionLabelsString, optionColorsString, type) {
  const optionValues = processOptionValues(optionValuesString, type);
  const optionLabels = splitOnNewLinesOrCommas(optionLabelsString);
  const optionColors = splitOnNewLinesOrCommas(optionColorsString);
  const options = [];
  optionValues.forEach((value, i) => {
    const color = optionColors[i];
    const label = optionLabels[i];

    if (color) {
      // Use full object, using value as label if none defined
      options[i] = {
        value,
        color,
        label: label || value, // Use option text as the label if no explicit label defined
      };
    } else if (label) {
      // Leave color undefined - default will be added by meditrak through destructuring
      options[i] = {
        value,
        label,
      };
    } else if (type !== 'Binary') {
      // Neither label or color defined, use simple text string
      options[i] = value;
    }
  });

  return options;
}

/**
 * Converts the validation criteria value strings into more JS friendly values
 * e.g. mandatory: "Yes" becomes mandatory: true, and min: "40" becomes min: 40.0
 * @param {string} value The value to be processed
 */
function processValidationCriteriaValue(value) {
  const valueTranslations = {
    true: true,
    false: false,
  };
  if (valueTranslations[value] !== undefined) {
    return valueTranslations[value];
  }
  return parseFloat(value);
}
