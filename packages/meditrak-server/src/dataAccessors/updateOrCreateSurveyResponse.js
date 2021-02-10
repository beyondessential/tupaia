/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import momentTimezone from 'moment-timezone';
import { DatabaseError, UploadError } from '@tupaia/utils';
import { uploadImage } from '../s3';
import { BUCKET_PATH, getImageFilePath } from '../s3/constants';
import { getEntityIdFromClinicId } from '../database/utilities';
import { stripTimezoneFromDate } from '../utilities';

async function saveAnswer(models, answer, surveyResponseId) {
  const answerDocument = {
    id: answer.id,
    type: answer.type,
    question_id: answer.question_id,
    survey_response_id: surveyResponseId,
  };
  if (answer.type === 'Photo') {
    const validFileIdRegex = RegExp('^[a-f\\d]{24}$');
    if (validFileIdRegex.test(answer.body)) {
      // if this is passed a valid id in the answer body
      answerDocument.text = `${BUCKET_PATH}${getImageFilePath()}${answer.body}.png`;
    } else {
      // included for backwards compatibility passing base64 strings for images
      try {
        answerDocument.text = await uploadImage(answer.body);
      } catch (error) {
        throw new UploadError(error);
      }
    }
  } else {
    answerDocument.text = answer.body;
  }
  try {
    await models.answer.updateOrCreate(
      { survey_response_id: surveyResponseId, question_id: answer.question_id },
      answerDocument,
    );
  } catch (error) {
    throw new DatabaseError('saving answer', error);
  }
}

/**
 * Creates or updates survey responses from passed changes
 */
export async function updateOrCreateSurveyResponse(models, surveyResponseObject) {
  const {
    id: surveyResponseId,
    answers,
    clinic_id: clinicId,
    ...surveyResponseProperties
  } = surveyResponseObject;
  const entitiesCreated = surveyResponseObject.entities_created || [];
  const optionsCreated = surveyResponseObject.options_created || [];
  let surveyResponse;
  try {
    await createEntities(models, entitiesCreated, surveyResponseObject.survey_id);
    await createOptions(models, optionsCreated);

    // Ensure entity_id is populated, supporting legacy versions of MediTrak
    if (clinicId) {
      const entityId = await getEntityIdFromClinicId(models, clinicId);
      surveyResponseProperties.entity_id = entityId;
    }

    // Ensure data_time is populated, supporting legacy versions of MediTrak
    const {
      data_time: suppliedDataTime,
      submission_time: submissionTime, // v1.7.87 to v1.9.110 (inclusive) uses submission_time
      end_time: endTime, // prior to v1.7.87 fall back to end_time
      timezone,
    } = surveyResponseObject;
    const dataTime = suppliedDataTime || submissionTime || endTime;

    // Convert to the original timezone, then strip timezone suffix, so it ends up in db as it
    // appeared to the original survey submitter
    surveyResponseProperties.data_time = stripTimezoneFromDate(
      momentTimezone(dataTime).tz(timezone).format(),
    );

    surveyResponse = await models.surveyResponse.updateOrCreate(
      {
        id: surveyResponseId,
      },
      {
        id: surveyResponseId,
        ...surveyResponseProperties,
      },
    );
  } catch (error) {
    throw new DatabaseError(`creating/updating survey response with id ${surveyResponseId}`, error);
  }
  await Promise.all(answers.map(answer => saveAnswer(models, answer, surveyResponse.id)));
}

const createOptions = async (models, optionsCreated) => {
  const options = [];

  for (const optionObject of optionsCreated) {
    const { value, option_set_id: optionSetId } = optionObject;
    const largestSorOrder = await models.option.getLargestSortOrder(optionSetId);
    const optionRecord = await models.option.updateOrCreate(
      { option_set_id: optionSetId, value },
      {
        ...optionObject,
        sort_order: largestSorOrder + 1, // append the option to the end to resolve any sort order conflict from other devices
        attributes: {},
      },
    );
    options.push(optionRecord);
  }

  return options;
};

const createEntities = async (models, entitiesCreated, surveyId) => {
  const survey = await models.survey.findById(surveyId);
  const dataGroup = await survey.dataGroup();

  return Promise.all(
    entitiesCreated.map(async entity =>
      models.entity.updateOrCreate(
        { id: entity.id },
        {
          ...entity,
          metadata:
            dataGroup.service_type === 'dhis'
              ? { dhis: { isDataRegional: !!dataGroup.config.isDataRegional } }
              : {},
        },
      ),
    ),
  );
};
