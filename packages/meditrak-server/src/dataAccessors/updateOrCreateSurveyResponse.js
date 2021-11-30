/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import momentTimezone from 'moment-timezone';
import { DatabaseError, UploadError, stripTimezoneFromDate, reformatDateStringWithoutTz, ValidationError } from '@tupaia/utils';
import { uploadImage } from '../s3';
import { BUCKET_PATH, getImageFilePath } from '../s3/constants';
import { DEFAULT_DATABASE_TIMEZONE, getEntityIdFromClinicId } from '../database';

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
    surveyResponseProperties.data_time = getDataTime(surveyResponseObject);

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
  const event = await survey.event();

  return Promise.all(
    entitiesCreated.map(async entity =>
      models.entity.updateOrCreate(
        { id: entity.id },
        {
          ...entity,
          metadata:
            event.service_type === 'dhis'
              ? { dhis: { isDataRegional: !!event.config.isDataRegional } }
              : {},
        },
      ),
    ),
  );
};

/**
 * @param surveyResponseObject
 * @return {string}
 * @throws ValidationError
 */
const getDataTime = surveyResponseObject => {
  const {
    data_time: suppliedDataTime,
    submission_time: submissionTime, // v1.7.87 to v1.9.110 (inclusive) uses submission_time
    end_time: endTime, // prior to v1.7.87 fall back to end_time
    timezone: suppliedTimezone,
  } = surveyResponseObject;

  if (suppliedDataTime) {

    if (suppliedTimezone) {
      // Timezone specified, strip it
      return stripTimezoneFromDate(
        momentTimezone(suppliedDataTime).tz(suppliedTimezone).format(),
      );
    }

    // No timezone specified. We are submitting the data_time explicitly without a tz.
    //
    // If the input is in a known format like ISO8601 without tz, we can use this directly, we just
    // reformat it into our specific format without tz.
    const reformattedDataTime = reformatDateStringWithoutTz(suppliedDataTime);
    if (reformattedDataTime) {
      return reformattedDataTime;
    } else {
      throw new ValidationError(`Unable to parse data_time ${suppliedDataTime} against known formats without timezone. Either use a known format or specify a timezone.`);
    }
  }

  // Fallback for older versions
  const dataTime = submissionTime || endTime;

  const timezone = suppliedTimezone || DEFAULT_DATABASE_TIMEZONE; // if no timezone provided, use db default

  // Convert to the original timezone, then strip timezone suffix, so it ends up in db as it
  // appeared to the original survey submitter
  return stripTimezoneFromDate(
    momentTimezone(dataTime).tz(timezone).format(),
  );
}