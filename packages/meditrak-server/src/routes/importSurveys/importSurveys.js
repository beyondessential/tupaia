/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import xlsx from 'xlsx';
import {
  respond,
  DatabaseError,
  UploadError,
  ImportValidationError,
  ValidationError,
  ObjectValidator,
} from '@tupaia/utils';
import { deleteScreensForSurvey, deleteOrphanQuestions } from '../../dataAccessors';
import { ANSWER_TYPES } from '../../database/models/Answer';
import {
  splitStringOnComma,
  splitOnNewLinesOrCommas,
  extractTabNameFromQuery,
  getArrayQueryParameter,
} from '../utilities';
import { ConfigImporter } from './ConfigImporter';
import { constructQuestionValidators } from './constructQuestionValidators';
import {
  processSurveyMetadataRow,
  validateSurveyMetadataRow,
  SURVEY_METADATA,
} from './processSurveyMetadata';
import {
  caseAndSpaceInsensitiveEquals,
  convertCellToJson,
  findOrCreateSurveyCode,
} from './utilities';

const QUESTION_TYPE_LIST = Object.values(ANSWER_TYPES);

const validateQuestionExistence = rows => {
  const isQuestionRow = ({ type }) => QUESTION_TYPE_LIST.includes(type);
  if (!rows || !rows.some(isQuestionRow)) {
    throw new ImportValidationError('No questions listed in import file');
  }
  return true;
};

/**
 * Responds to POST requests to the /surveys endpoint
 */
export async function importSurveys(req, res) {
  const { models } = req;
  if (!req.query || !req.query.surveyNames) {
    throw new ValidationError('HTTP query should contain surveyNames');
  }
  const requestedSurveyNames = getArrayQueryParameter(req.query.surveyNames);
  if (!req.file) {
    throw new UploadError();
  }
  const workbook = xlsx.readFile(req.file.path);
  try {
    await models.wrapInTransaction(async transactingModels => {
      const permissionGroup = await transactingModels.permissionGroup.findOne({
        name: req.query.permissionGroup || 'Public',
      });
      if (!permissionGroup) {
        throw new DatabaseError('finding permission group');
      }

      let surveyGroup;
      if (req.query.surveyGroup) {
        surveyGroup = await transactingModels.surveyGroup.findOrCreate({
          name: req.query.surveyGroup,
        });
      }

      // Go through each sheet, and make a survey for each
      for (const surveySheets of Object.entries(workbook.Sheets)) {
        const [tabName, sheet] = surveySheets;
        const surveyName = extractTabNameFromQuery(tabName, requestedSurveyNames);
        const code = await findOrCreateSurveyCode(transactingModels, surveyName);

        // Get the survey based on the name of the sheet/tab
        const survey = await transactingModels.survey.findOrCreate(
          {
            name: surveyName,
          },
          {
            // If no survey with that name is found, give it a code and public permissions
            code,
            permission_group_id: permissionGroup.id,
          },
        );
        if (!survey) {
          throw new DatabaseError('creating survey, check format of import file');
        }

        // Work out what fields of the survey should be updated based on query params
        const fieldsToForceUpdate = {};
        if (req.query.countryIds) {
          // Set the countries this survey is available in
          fieldsToForceUpdate.country_ids = getArrayQueryParameter(req.query.countryIds);
        }
        if (surveyGroup) {
          // Set the survey group this survey is attached to
          fieldsToForceUpdate.survey_group_id = surveyGroup.id;
        }
        if (req.query.permissionGroup) {
          // A non-default permission group was provided
          fieldsToForceUpdate.permission_group_id = permissionGroup.id;
        }
        if (req.query.surveyCode) {
          // Set or update the code for this survey
          fieldsToForceUpdate.code = req.query.surveyCode;
        }
        // Update the survey based on the fields to force update
        if (Object.keys(fieldsToForceUpdate).length > 0) {
          await transactingModels.survey.update({ id: survey.id }, fieldsToForceUpdate);
        }

        // Delete all existing survey screens and components that were attached to this survey
        await deleteScreensForSurvey(transactingModels, survey.id);
        const rows = xlsx.utils.sheet_to_json(sheet);
        validateQuestionExistence(rows);

        // Add all questions to the survey, creating screens, components and questions as required
        let currentScreen;
        let currentSurveyScreenComponent;
        let hasSeenSubmissionDate = false;
        const questionCodes = []; // An array to hold all qustion codes, allowing duplicate checking
        const configImporter = new ConfigImporter(transactingModels, rows);
        const objectValidator = new ObjectValidator(constructQuestionValidators(transactingModels));
        let hasPrimaryEntityQuestion = false;
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          const constructImportValidationError = (message, field) =>
            new ImportValidationError(message, excelRowNumber, field, tabName);

          if (row.type === SURVEY_METADATA) {
            await validateSurveyMetadataRow(rows, rowIndex, constructImportValidationError);
            await processSurveyMetadataRow(transactingModels, rows, rowIndex, survey.id);
            continue;
          }

          const questionObject = row;
          const excelRowNumber = rowIndex + 2; // +2 to make up for header and 0 index

          // Validate rows
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

          // Validate max one submission date question
          if (questionObject.type === 'SubmissionDate') {
            if (hasSeenSubmissionDate) {
              // Previously had another submission date question
              throw new ImportValidationError(
                'Only one SubmissionDate question allowed',
                excelRowNumber,
              );
            }
            hasSeenSubmissionDate = true;
          }

          // Extract question details from spreadsheet row
          const {
            code,
            type,
            name,
            text,
            questionLabel,
            detail,
            detailLabel,
            options,
            optionLabels,
            optionColors,
            newScreen,
            visibilityCriteria,
            validationCriteria,
            optionSet,
          } = questionObject;

          // Compose question based on details from spreadsheet
          const questionToUpsert = {
            code,
            type,
            name,
            text,
            detail,
            options: processOptions(options, optionLabels, optionColors),
            option_set_id: await processOptionSetName(transactingModels, optionSet),
          };

          // Either create or update the question depending on if there exists a matching code
          let question;
          if (code) {
            question = await transactingModels.question.updateOrCreate({ code }, questionToUpsert);
          } else {
            // No code in spreadsheet, can't match so just create a new question
            question = await transactingModels.question.create(questionToUpsert);
          }

          // Generate the screen and screen component
          const shouldStartNewScreen = caseAndSpaceInsensitiveEquals(newScreen, 'yes');
          if (!currentScreen || shouldStartNewScreen) {
            // Spreadsheet indicates this question starts a new screen
            // Create a new survey screen
            currentScreen = await transactingModels.surveyScreen.create({
              survey_id: survey.id,
              screen_number: currentScreen ? currentScreen.screen_number + 1 : 1, // Next screen
            });
            // Clear existing survey screen component
            currentSurveyScreenComponent = undefined;
          }

          // Create a new survey screen component to display this question
          const visibilityCriteriaObject = await convertCellToJson(
            visibilityCriteria,
            splitStringOnComma,
          );
          const processedVisibilityCriteria = {};
          await Promise.all(
            Object.entries(visibilityCriteriaObject).map(async ([questionCode, answers]) => {
              if (questionCode === '_conjunction') {
                // This is the special _conjunction key, extract the 'and' or the 'or' from answers,
                // i.e. { conjunction: ['and'] } -> { conjunction: 'and' }
                processedVisibilityCriteria._conjunction = answers[0];
              } else if (questionCode === 'hidden') {
                processedVisibilityCriteria.hidden = answers[0] === 'true';
              } else {
                const { id: questionId } = await transactingModels.question.findOne({
                  code: questionCode,
                });
                processedVisibilityCriteria[questionId] = answers;
              }
            }),
          );

          currentSurveyScreenComponent = await transactingModels.surveyScreenComponent.create({
            screen_id: currentScreen.id,
            question_id: question.id,
            component_number: currentSurveyScreenComponent
              ? currentSurveyScreenComponent.component_number + 1
              : 1,
            visibility_criteria: JSON.stringify(processedVisibilityCriteria),
            validation_criteria: JSON.stringify(
              convertCellToJson(validationCriteria, processValidationCriteriaValue),
            ),
            question_label: questionLabel,
            detail_label: detailLabel,
          });

          try {
            const componentId = currentSurveyScreenComponent.id;
            await configImporter.add(rowIndex, componentId);
          } catch (error) {
            const validationError = constructImportValidationError(error.message, 'config');
            throw validationError;
          }
        }

        await configImporter.import();

        // Clear  any orphaned questions (i.e. questions no longer included in a survey)
        await deleteOrphanQuestions(transactingModels);
      }
    });
  } catch (error) {
    if (error.respond) {
      throw error; // Already a custom error with a responder
    }
    throw new DatabaseError('importing surveys', error);
  }
  respond(res, { message: 'Imported surveys' });
}

async function processOptionSetName(models, name) {
  // TODO: Figure out why undefined value is returning all results.
  if (name) {
    const optionSet = await models.optionSet.findOne({ name });
    return optionSet.id;
  }
  return null;
}

function processOptions(optionValuesString, optionLabelsString, optionColorsString) {
  const optionValues = splitOnNewLinesOrCommas(optionValuesString);
  const optionLabels = splitOnNewLinesOrCommas(optionLabelsString);
  const optionColors = splitOnNewLinesOrCommas(optionColorsString);
  return optionValues.map((value, i) => {
    const color = optionColors[i];
    const label = optionLabels[i];

    if (color) {
      // Use full object, using value as label if none defined
      return {
        value,
        color,
        label: label || value, // Use option text as the label if no explicit label defined
      };
    }

    if (label) {
      // Leave color undefined - default will be added by meditrak through destructuring
      return {
        value,
        label,
      };
    }

    // Neither label or color defined, use simple text string
    return value;
  });
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
