/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  ValidationError,
  MultiValidationError,
  ObjectValidator,
  hasContent,
  constructRecordExistsWithId,
  constructRecordExistsWithCode,
  constructIsEmptyOr,
  takesIdForm,
  takesDateForm,
} from '@tupaia/utils';
import { constructAnswerValidator } from './utilities/constructAnswerValidator';
import { findQuestionsInSurvey } from '../dataAccessors';
import { assertCanSubmitSurveyResponses } from './import/importSurveyResponses/assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../permissions';
import { saveResponsesToDatabase } from './surveyResponses';
import { upsertEntitiesAndOptions } from './surveyResponses/upsertEntitiesAndOptions';

const createSurveyResponseValidator = models =>
  new ObjectValidator({
    entity_id: [constructIsEmptyOr(constructRecordExistsWithId(models.entity))],
    entity_code: [constructIsEmptyOr(constructRecordExistsWithCode(models.entity))],
    survey_id: [hasContent, constructRecordExistsWithId(models.survey)],
    start_time: [constructIsEmptyOr(takesDateForm)],
    end_time: [constructIsEmptyOr(takesDateForm)],
    timestamp: [hasContent],
  });

async function validateResponse(models, body) {
  if (!body) {
    throw new ValidationError('Survey responses must not be null');
  }

  const surveyResponseValidator = createSurveyResponseValidator(models);
  await surveyResponseValidator.validate(body);

  if (!body.entity_id && !body.entity_code) {
    throw new Error('Must provide one of entity_id or entity_code');
  }

  const surveyQuestions = await findQuestionsInSurvey(models, body.survey_id);

  const { answers } = body;

  // answers format: ReturnType<constructAnswerValidators>
  if (Array.isArray(answers)) {
    const answerObjectValidator = new ObjectValidator(constructAnswerValidators(models));
    for (let i = 0; i < answers.length; i++) {
      await answerObjectValidator.validate(
        answers[i],
        (message, field) =>
          new ValidationError(
            `Answer at index ${i} had invalid field "${field}" causing the message "${message}"`,
          ),
      );
    }
  } else {
    // answers format: { [$questionCode]: [$answerValue] }
    const answerValidations = Object.entries(answers).map(async ([questionCode, value]) => {
      if (value === null || value === undefined) {
        throw new ValidationError(`Answer for ${questionCode} is missing value`);
      }

      const question = surveyQuestions.find(q => q.code === questionCode);
      if (!question) {
        throw new ValidationError(
          `Could not find question with code ${questionCode} on survey ${body.survey_id}`,
        );
      }

      try {
        const answerValidator = new ObjectValidator({}, constructAnswerValidator(models, question));
        await answerValidator.validate({ answer: value });
      } catch (e) {
        // validator will always complain of field "answer" but in this context it is not
        // particularly useful
        throw new Error(e.message.replace('field "answer"', `question code "${questionCode}"`));
      }
    });

    await Promise.all(answerValidations);
  }
}

const validateAllResponses = async (models, responses) => {
  const validations = await Promise.all(
    responses.map(async (r, i) => {
      try {
        await validateResponse(models, r);
        return null;
      } catch (e) {
        return { row: i, error: e.message };
      }
    }),
  );

  const errors = validations.filter(x => x);
  if (errors.length > 0) {
    throw new MultiValidationError(
      'The request contained invalid responses. No records have been created; please fix the issues and send the whole request again.',
      errors,
    );
  }
};

export const submitResponses = async (models, userId, responses) => {
  // Upsert entities and options that were created in user's local database
  await upsertEntitiesAndOptions(models, responses);
  // Allow responses to be submitted in bulk
  await validateAllResponses(models, responses);
  return saveResponsesToDatabase(models, userId, responses);
};

export async function surveyResponse(req, res) {
  const { userId, body, models } = req;

  let results = [];
  const responses = Array.isArray(body) ? body : [body];
  // Upsert entities and options that were created in user's local database
  await upsertEntitiesAndOptions(models, responses);

  await models.wrapInTransaction(async transactingModels => {
    await validateAllResponses(transactingModels, responses);
    // Check permissions
    const surveyResponsePermissionsChecker = async accessPolicy => {
      await assertCanSubmitSurveyResponses(accessPolicy, transactingModels, responses);
    };
    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
    );

    results = await saveResponsesToDatabase(transactingModels, userId, responses);
  });
  res.send({ count: responses.length, results });
}

const constructAnswerValidators = models => ({
  id: [hasContent, takesIdForm],
  type: [hasContent],
  question_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.question)],
  body: [hasContent],
});
