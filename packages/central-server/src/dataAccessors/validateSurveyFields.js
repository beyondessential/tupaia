export const validateSurveyFields = async (models, surveyId, surveyFields) => {
  const { periodGranularity, dhisInstanceCode, serviceType } = surveyFields;

  const survey = surveyId ? await models.survey.findById(surveyId) : null;
  const dataGroup = survey ? await models.dataGroup.findOne({ code: survey.code }) : null;

  if (periodGranularity) {
    const resolvedServiceType = surveyFields.serviceType || dataGroup.service_type;
    if (resolvedServiceType === 'dhis') {
      throw new Error('Reporting period is not available for dhis surveys');
    }

    const hasResponses = survey && (await survey.hasResponses());
    if (hasResponses && survey.period_granularity !== periodGranularity) {
      throw new Error(
        `Cannot change the reporting period for "${survey.name}" while there are still records in the survey_response table`,
      );
    }
  }

  if (serviceType === 'dhis' && !dhisInstanceCode) {
    throw new Error('Must specify Dhis Server');
  }
};
