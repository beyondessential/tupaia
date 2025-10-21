import momentTimezone from 'moment-timezone';

import {
  DatabaseError,
  reformatDateStringWithoutTz,
  stripTimezoneFromDate,
  ValidationError,
} from '@tupaia/utils';
import { upsertAnswers } from '../../../dataAccessors/upsertAnswers';
import { DEFAULT_DATABASE_TIMEZONE, getEntityIdFromClinicId } from '../../../database';
import { upsertEntitiesAndOptions } from '../../surveyResponses';

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

  try {
    await models.wrapInTransaction(async transactingModels => {
      await upsertEntitiesAndOptions(transactingModels, [surveyResponseObject]);

      const survey = await transactingModels.survey.findById(surveyResponseObject.survey_id);

      // Ensure entity_id is populated, supporting legacy versions of MediTrak
      if (clinicId) {
        const entityId = await getEntityIdFromClinicId(transactingModels, clinicId);
        surveyResponseProperties.entity_id = entityId;
      }

      // Ensure data_time is populated, supporting legacy versions of MediTrak
      surveyResponseProperties.data_time = getDataTime(surveyResponseObject);

      // If the response is for a survey where approval is required, set approval to pending
      const approvalStatus = survey.requires_approval
        ? transactingModels.surveyResponse.approvalStatusTypes.PENDING
        : transactingModels.surveyResponse.approvalStatusTypes.NOT_REQUIRED;

      const surveyResponse = await transactingModels.surveyResponse.updateOrCreate(
        { id: surveyResponseId },
        {
          id: surveyResponseId,
          approval_status: approvalStatus,
          ...surveyResponseProperties,
        },
      );

      await upsertAnswers(transactingModels, answers, surveyResponse.id);
    });
  } catch (error) {
    throw new DatabaseError(`creating/updating survey response with ID ${surveyResponseId}`, error);
  }
}

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
