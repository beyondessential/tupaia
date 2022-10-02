/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import assert from 'assert';

const findSurveyServiceType = async (models, code) => {
  assert.ok(code);

  const survey = await models.survey.findOne({ code });
  if (!survey) {
    throw new Error(`Cannot find service type for survey ${code} - survey was not found in the db`);
  }

  const dataGroup = await survey.dataGroup();
  assert.ok(dataGroup); // Each survey has a data group
  return dataGroup.service_type;
};

export const validateSurveyFields = async (models, surveyFields) => {
  const { code, periodGranularity, serviceType, dhisInstanceCode } = surveyFields;

  if (periodGranularity) {
    const serviceType = surveyFields.serviceType || (await findSurveyServiceType(models, code));
    if (serviceType === 'dhis') {
      throw new Error('Reporting period is not available for dhis surveys');
    }

    const survey = await models.survey.findOne({ code });
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
