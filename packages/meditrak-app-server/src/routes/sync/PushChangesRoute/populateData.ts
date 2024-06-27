import {
  DatabaseError,
  reformatDateStringWithoutTz,
  stripTimezoneFromDate,
  ValidationError,
} from '@tupaia/utils';
import { MeditrakSurveyResponseRequest } from '@tupaia/types';
import momentTimezone from 'moment-timezone';
import { MeditrakAppServerModelRegistry } from '../../../types';
import { getEntityIdFromClinicId } from './getEntityIdFromClinicId';

const DEFAULT_DATABASE_TIMEZONE = 'Pacific/Auckland';

const approvalStatusTypes = {
  NOT_REQUIRED: 'not_required',
  PENDING: 'pending',
  REJECTED: 'rejected',
  APPROVED: 'approved',
};

// Populate data to support legacy versions of Meditrak
export const populateData = async (
  models: MeditrakAppServerModelRegistry,
  surveyResponse: MeditrakSurveyResponseRequest,
) => {
  const {
    id: surveyResponseId,
    clinic_id: clinicId,
    survey_id: surveyId,
    ...surveyResponseProperties
  } = surveyResponse;
  try {
    const survey = await models.survey.findById(surveyId);

    // Ensure entity_id is populated, supporting legacy versions of MediTrak
    if (clinicId) {
      const entityId = await getEntityIdFromClinicId(models, clinicId);
      surveyResponseProperties.entity_id = entityId;
    }

    // If the response is for a survey where approval is required, set approval to pending
    let approvalStatus = approvalStatusTypes.NOT_REQUIRED;
    if (survey.requires_approval) {
      approvalStatus = approvalStatusTypes.PENDING;
    }
    surveyResponseProperties.approval_status = approvalStatus;

    return {
      id: surveyResponseId,
      survey_id: surveyId,
      ...surveyResponseProperties,
    };
  } catch (error) {
    throw new DatabaseError(`populate data for survey response with id ${surveyResponseId}`, error);
  }
};
