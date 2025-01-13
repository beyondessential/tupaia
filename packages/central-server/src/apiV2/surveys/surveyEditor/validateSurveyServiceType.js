import { ValidationError } from '@tupaia/utils';

export const validateSurveyServiceType = async (models, surveyId, serviceType) => {
  if (!surveyId) return;
  const survey = await models.survey.findById(surveyId);

  const existingDataGroup = await models.dataGroup.findOne({ code: survey.code });
  if (existingDataGroup !== null) {
    if (serviceType !== existingDataGroup.service_type) {
      throw new ValidationError(
        `Data service must match. The existing survey has Data service: ${existingDataGroup.service_type}. Attempted to change to Data service: ${serviceType}.`,
      );
    }
  }
};
