/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

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
  constructIsOneOf,
} from '@tupaia/utils';
import { updateOrCreateSurveyResponse, addSurveyImage } from '../dataAccessors';

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
  for (const { action, payload } of changes) {
    if (!ACTION_HANDLERS[action]) {
      throw new ValidationError(`${action} is not a supported change action`);
    }
    await PAYLOAD_VALIDATORS[action](models, payload);
    await ACTION_HANDLERS[action](models, payload);
  }

  // Reset the cache for the current users rewards.
  await models.userReward.resetUserRewardCacheForUser(req.userId);
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

const clinicOrEntityIdExist = (id, obj) => {
  if (!(obj.clinic_id || obj.entity_id)) {
    throw new Error('Either clinic_id or entity_id are required.');
  }
};

const constructEntitiesCreatedValidators = models => ({
  id: [hasContent, takesIdForm],
  code: [hasContent],
  parent_id: [takesIdForm],
  name: [hasContent],
  type: [constructIsOneOf(Object.values(models.entity.types))],
  country_code: [hasContent],
});

const constructIsValidEntity = models => async value =>
  new ObjectValidator(constructEntitiesCreatedValidators(models)).validate(value);

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
});

const constructAnswerValidators = models => ({
  id: [hasContent, takesIdForm],
  type: [hasContent],
  question_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.question)],
  body: [hasContent],
});
