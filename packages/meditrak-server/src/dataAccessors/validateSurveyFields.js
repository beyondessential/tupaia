/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const validateSurveyFields = async (models, surveyFields) => {
  const { code, serviceType, periodGranularity } = surveyFields;

  const existingDataGroup = await models.dataSource.findOne({ code, type: 'dataGroup' });
  if (serviceType && existingDataGroup && serviceType !== existingDataGroup.service_type) {
    throw new Error(
      `Data service must match. The existing survey has Data service: ${existingDataGroup.service_type}. Attempted to import with Data service: ${serviceType}.`,
    );
  }

  // If a data group exists, use its service type; if not, use the supplied field
  // selected service type
  const dataGroupServiceType = existingDataGroup?.['service_type'] || serviceType;
  if (periodGranularity && dataGroupServiceType === 'dhis') {
    throw new Error('Reporting period is not available for dhis surveys');
  }
};
