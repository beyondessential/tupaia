/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const findSurveyServiceType = async (models, code) => {
  const survey = await models.survey.findOne({ code });
  const dataGroup = await survey.dataGroup();
  return dataGroup.service_type;
};

export const validateSurveyFields = async (models, surveyFields) => {
  const { code, period_granularity } = surveyFields;

  if (period_granularity) {
    const serviceType = surveyFields.serviceType || (await findSurveyServiceType(models, code));
    if (serviceType === 'dhis') {
      throw new Error('Reporting period is not available for dhis surveys');
    }

    const survey = await models.survey.findOne({ code });
    const hasResponses = survey && (await survey.hasResponses());
    if (hasResponses && survey.period_granularity !== period_granularity) {
      throw new Error(
        `Cannot change the reporting period for "${survey.name}" while there are still records in the survey_response table`,
      );
    }
  }
};
