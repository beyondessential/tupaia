/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getMeasureBuilder } from './getMeasureBuilder';
import { OPERATOR_TO_VALUE_CHECK } from '../dataBuilders/helpers/checkAgainstConditions';

export const fetchComposedData = async (aggregator, dhisApi, query, config) => {
  const { measureBuilders, dataServices } = config || {};
  if (!measureBuilders) {
    throw new Error('Measure builders not provided');
  }

  const responses = {};
  const addResponse = async ([builderKey, builderData]) => {
    const { measureBuilder: builderName, measureBuilderConfig: builderConfig } = builderData;
    const buildMeasure = getMeasureBuilder(builderName);
    responses[builderKey] = await buildMeasure(aggregator, dhisApi, query, {
      ...builderConfig,
      dataServices,
    });
  };
  await Promise.all(Object.entries(measureBuilders).map(addResponse));

  return responses;
};

export const mapMeasureValuesToGroups = (measureValue, dataElementGroupCode, groups) => {
  const { organisationUnitCode, [dataElementGroupCode]: originalValue } = measureValue;
  const valueGroup = Object.entries(groups).find(([groupName, groupConfig]) => {
    const groupCheck = OPERATOR_TO_VALUE_CHECK[groupConfig.operator];
    if (!groupCheck) {
      throw new Error(`No function defined for operator: ${groupConfig.operator}`);
    }
    return groupCheck(originalValue, groupConfig.value);
  });

  return {
    organisationUnitCode,
    originalValue,
    [dataElementGroupCode]: valueGroup ? valueGroup[0] : originalValue,
  };
};
