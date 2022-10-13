import {
  DatabaseError,
  reformatDateStringWithoutTz,
  stripTimezoneFromDate,
  ValidationError,
} from '@tupaia/utils';
import momentTimezone from 'moment-timezone';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { getEntityIdFromClinicId } from './getEntityIdFromClinicId';
import { ValidatedSurveyResponseObject } from './validateInboundSurveyResponses';

const DEFAULT_DATABASE_TIMEZONE = 'Pacific/Auckland';

/**
 * @param surveyResponse
 * @return {string}
 * @throws ValidationError
 */
const getDataTime = (surveyResponse: ValidatedSurveyResponseObject) => {
  const {
    data_time: suppliedDataTime,
    submission_time: submissionTime, // v1.7.87 to v1.9.110 (inclusive) uses submission_time
    end_time: endTime, // prior to v1.7.87 fall back to end_time
    timezone: suppliedTimezone,
  } = surveyResponse;

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

// Populate data to support legacy versions of Meditrak
export const populateData = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponse: ValidatedSurveyResponseObject,
) => {
  const {
    id: surveyResponseId,
    clinic_id: clinicId,
    survey_id: surveyId,
    assessor_name: assessorName,
    ...surveyResponseProperties
  } = surveyResponse;
  try {
    const survey = await models.survey.findById(surveyId);

    // Ensure entity_id is populated, supporting legacy versions of MediTrak
    if (clinicId) {
      const entityId = await getEntityIdFromClinicId(models, clinicId);
      surveyResponseProperties.entity_id = entityId;
    }

    // Ensure data_time is populated, supporting legacy versions of MediTrak
    surveyResponseProperties.data_time = getDataTime(surveyResponse);

    // If the response is for a survey where approval is required, set approval to pending
    let approvalStatus = models.surveyResponse.approvalStatusTypes.NOT_REQUIRED;
    if (survey.requires_approval) {
      approvalStatus = models.surveyResponse.approvalStatusTypes.PENDING;
    }
    surveyResponseProperties.approval_status = approvalStatus;

    return { id: surveyResponseId, survey_id: surveyId, ...surveyResponseProperties };
  } catch (error) {
    throw new DatabaseError(`populate data for survey response with id ${surveyResponseId}`, error);
  }
};
