/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { cloneDeep } from 'lodash';
import { AnalyticsRefresher } from '@tupaia/database';
import {
  respond,
  ValidationError,
  ObjectValidator,
  hasContent,
  isPresent,
  constructRecordExistsWithId,
  constructIsEmptyOr,
  constructEveryItem,
  takesIdForm,
  takesDateForm,
  isNumber,
  constructIsValidEntityType,
} from '@tupaia/utils';
import { updateOrCreateSurveyResponse, addSurveyImage } from '../dataAccessors';
import { assertCanSubmitSurveyResponses } from './import/importSurveyResponses/assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../permissions';
import {
  translateObjectFields,
  translateEntityCodeToId,
  translateSurveyCodeToId,
  translateUserEmailToIdAndAssessorName,
  translateQuestionCodeToId,
} from './utilities';

// Action constants
const SUBMIT_SURVEY_RESPONSE = 'SubmitSurveyResponse';
const ADD_SURVEY_IMAGE = 'AddSurveyImage';

/**
 * Responds to POST requests to the /changes endpoint, integrating the data posted in the request
 * body according to the action types causing the changes
 * @param {object}  event    - event data (e.g. url, query parameters, body)
 * @param {object}  context  - runtime info (Lambda metadata)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function postChanges(req, res) {
  const changes = req.body;
  const { models } = req;
  const translatedChanges = [];
  for (const { action, payload, ...rest } of changes) {
    if (!ACTION_HANDLERS[action]) {
      throw new ValidationError(`${action} is not a supported change action`);
    }
    const translatedPayload = await PAYLOAD_TRANSLATORS[action](models, payload);
    await PAYLOAD_VALIDATORS[action](models, translatedPayload);
    translatedChanges.push({ action, translatedPayload, ...rest });
  }

  // Check permissions for survey responses
  const surveyResponsePayloads = translatedChanges
    .filter(c => c.action === SUBMIT_SURVEY_RESPONSE)
    .map(c => c.translatedPayload.survey_response || c.translatedPayload);
  const surveyResponsePermissionsChecker = async accessPolicy => {
    await assertCanSubmitSurveyResponses(accessPolicy, models, surveyResponsePayloads);
  };
  await req.assertPermissions(
    assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
  );

  for (const { action, translatedPayload, ...rest } of translatedChanges) {
    await ACTION_HANDLERS[action](models, translatedPayload);

    if (action === SUBMIT_SURVEY_RESPONSE) {
      // TODO: Rework this functionality, as directly calling an analytics refresh here is both inefficient
      // and may create duplicate records in the analytics table
      const { waitForAnalyticsRebuild } = rest;
      if (waitForAnalyticsRebuild) {
        const { database } = models;
        await AnalyticsRefresher.refreshAnalytics(database);
      }
    }
  }

  respond(res, { message: 'Successfully integrated changes into server database' });
}

/**
 * Contains functions that accept the database and payload, and handle the relevant change action
 */
const ACTION_HANDLERS = {
  // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
  [SUBMIT_SURVEY_RESPONSE]: async (models, payload) =>
    updateOrCreateSurveyResponse(models, payload.survey_response || payload),
  [ADD_SURVEY_IMAGE]: addSurveyImage,
};

/**
 * Contains functions that accept the payload, and validate that it contains the requisite content
 * for the relevant change action, returning true if successful and throwing an error if not
 */
const PAYLOAD_VALIDATORS = {
  [SUBMIT_SURVEY_RESPONSE]: async (models, payload) =>
    validateSurveyResponseObject(models, payload.survey_response || payload), // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
  [ADD_SURVEY_IMAGE]: async (models, payload) => {
    const validator = new ObjectValidator({
      id: [hasContent],
      data: [hasContent],
    });
    await validator.validate(payload);
  },
};

/**
 * Contains functions that accept the payload, and translate the data so that the required fields are present
 * for the relevant change action, returning true if successful and throwing an error if not
 */
const PAYLOAD_TRANSLATORS = {
  [SUBMIT_SURVEY_RESPONSE]: async (models, payload) =>
    translateSurveyResponseObject(models, payload.survey_response || payload), // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
  [ADD_SURVEY_IMAGE]: (models, payload) => payload, // No translation required
};

async function validateSurveyResponseObject(models, surveyResponseObject) {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }
  const surveyResponseObjectValidator = new ObjectValidator(
    constructSurveyResponseValidators(models),
  );
  await surveyResponseObjectValidator.validate(surveyResponseObject);
  const answerObjectValidator = new ObjectValidator(constructAnswerValidators(models));
  for (let i = 0; i < surveyResponseObject.answers.length; i++) {
    await answerObjectValidator.validate(
      surveyResponseObject.answers[i],
      (message, field) =>
        new ValidationError(
          `Answer at index ${i} had invalid field "${field}" causing the message "${message}"`,
        ),
    );
  }
}

async function translateSurveyResponseObject(models, surveyResponseObject) {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  const surveyResponseTranslators = constructSurveyResponseTranslators(models);
  const answerTranslators = constructAnswerTranslators(models);

  if (
    !requiresSurveyResponseTranslation(
      surveyResponseObject,
      surveyResponseTranslators,
      answerTranslators,
    )
  ) {
    return surveyResponseObject;
  }

  const translatedSurveyResponseObject = cloneDeep(surveyResponseObject);
  await translateObjectFields(translatedSurveyResponseObject, surveyResponseTranslators);

  const { answers } = translatedSurveyResponseObject;
  if (Array.isArray(answers)) {
    for (let i = 0; i < answers.length; i++) {
      await translateObjectFields(answers[i], answerTranslators);
    }
  }

  return translatedSurveyResponseObject;
}

const requiresSurveyResponseTranslation = (
  surveyResponseObject,
  surveyResponseTranslators,
  answerTranslators,
) => {
  const surveyResponseTranslatorFields = Object.keys(surveyResponseTranslators);
  if (
    Object.keys(surveyResponseObject).some(field => surveyResponseTranslatorFields.includes(field))
  ) {
    return true;
  }

  const answerTranslatorFields = Object.keys(answerTranslators);
  const { answers } = surveyResponseObject;
  if (Array.isArray(answers)) {
    return answers.some(
      answer =>
        answer.body === '' ||
        Object.keys(answer).some(field => answerTranslatorFields.includes(field)),
    );
  }

  return false;
};

const clinicOrEntityIdExist = (id, obj) => {
  if (!(obj.clinic_id || obj.entity_id)) {
    throw new Error('Either clinic_id or entity_id are required.');
  }
};

const constructSurveyResponseTranslators = models => ({
  user_email: userEmail => translateUserEmailToIdAndAssessorName(models.user, userEmail),
  entity_code: entityCode => translateEntityCodeToId(models.entity, entityCode),
  survey_code: surveyCode => translateSurveyCodeToId(models.survey, surveyCode),
  answers: answers => ({ answers: answers.filter(a => a.body !== '') }), // remove any empty answers
});

const constructAnswerTranslators = models => ({
  question_code: questionCode => translateQuestionCodeToId(models.question, questionCode),
});

const constructEntitiesCreatedValidators = models => ({
  id: [hasContent, takesIdForm],
  code: [hasContent],
  parent_id: [takesIdForm],
  name: [hasContent],
  type: [constructIsValidEntityType(models.entity)],
  country_code: [hasContent],
});

const constructIsValidEntity = models => async value =>
  new ObjectValidator(constructEntitiesCreatedValidators(models)).validate(value);

const constructOptionsCreatedValidators = models => ({
  id: [hasContent, takesIdForm],
  value: [hasContent],
  option_set_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.optionSet)],
  sort_order: [isNumber],
});

const constructIsValidOption = models => async value =>
  new ObjectValidator(constructOptionsCreatedValidators(models)).validate(value);

const constructSurveyResponseValidators = models => ({
  id: [hasContent, takesIdForm],
  assessor_name: [hasContent],
  clinic_id: [clinicOrEntityIdExist, constructIsEmptyOr(takesIdForm)],
  entity_id: [clinicOrEntityIdExist, constructIsEmptyOr(takesIdForm)],
  start_time: [hasContent, takesDateForm],
  end_time: [hasContent, takesDateForm],
  survey_id: [hasContent, takesIdForm],
  user_id: [hasContent, takesIdForm],
  answers: [isPresent],
  entities_created: [constructIsEmptyOr(constructEveryItem(constructIsValidEntity(models)))],
  options_created: [constructIsEmptyOr(constructEveryItem(constructIsValidOption(models)))],
});

const constructAnswerValidators = models => ({
  id: [hasContent, takesIdForm],
  type: [hasContent],
  question_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.question)],
  body: [hasContent],
});
