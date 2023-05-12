/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import momentTimezone from 'moment-timezone';
import {
  DatabaseError,
  stripTimezoneFromDate,
  reformatDateStringWithoutTz,
  ValidationError,
} from '@tupaia/utils';
import { DEFAULT_DATABASE_TIMEZONE, getEntityIdFromClinicId } from '../database';
import { upsertAnswers } from './upsertAnswers';

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
    const survey = await models.survey.findById(surveyResponseObject.survey_id);

    // Ensure entity_id is populated, supporting legacy versions of MediTrak
    if (clinicId) {
      const entityId = await getEntityIdFromClinicId(models, clinicId);
      surveyResponseProperties.entity_id = entityId;
    }

    // Ensure data_time is populated, supporting legacy versions of MediTrak
    surveyResponseProperties.data_time = getDataTime(surveyResponseObject);

    // If the response is for a survey where approval is required, set approval to pending
    let approvalStatus = models.surveyResponse.approvalStatusTypes.NOT_REQUIRED;
    if (survey.requires_approval) {
      approvalStatus = models.surveyResponse.approvalStatusTypes.PENDING;
    }

    surveyResponse = await models.surveyResponse.updateOrCreate(
      {
        id: surveyResponseId,
      },
      {
        id: surveyResponseId,
        approval_status: approvalStatus,
        ...surveyResponseProperties,
      },
    );
  } catch (error) {
    throw new DatabaseError(`creating/updating survey response with id ${surveyResponseId}`, error);
  }
  await upsertAnswers(models, answers, surveyResponse.id);
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
      return stripTimezoneFromDate(momentTimezone(suppliedDataTime).tz(suppliedTimezone).format());
    }

    // No timezone specified. We are submitting the data_time explicitly without a tz.
    //
    // If the input is in a known format like ISO8601 without tz, we can use this directly, we just
    // reformat it into our specific format without tz.
    const reformattedDataTime = reformatDateStringWithoutTz(suppliedDataTime);
    if (reformattedDataTime) {
      return reformattedDataTime;
    }
    throw new ValidationError(
      `Unable to parse data_time ${suppliedDataTime} against known formats without timezone. Either use a known format or specify a timezone.`,
    );
  }

  // Fallback for older versions
  const dataTime = submissionTime || endTime;

  const timezone = suppliedTimezone || DEFAULT_DATABASE_TIMEZONE; // if no timezone provided, use db default

  // Convert to the original timezone, then strip timezone suffix, so it ends up in db as it
  // appeared to the original survey submitter
  return stripTimezoneFromDate(momentTimezone(dataTime).tz(timezone).format());
};
