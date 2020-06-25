/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getMeasureBuilder } from './getMeasureBuilder';
import { OPERATOR_TO_VALUE_CHECK } from '../dataBuilders/helpers/checkAgainstConditions';
import { Entity } from '../../models';
import { inspect } from 'util';

export const fetchComposedData = async (aggregator, dhisApi, query, config, entity) => {
  const { measureBuilders, dataServices } = config || {};
  if (!measureBuilders) {
    throw new Error('Measure builders not provided');
  }

  const responses = {};
  const addResponse = async ([builderKey, builderData]) => {
    const { measureBuilder: builderName, measureBuilderConfig: builderConfig } = builderData;
    const buildMeasure = getMeasureBuilder(builderName);
    responses[builderKey] = await buildMeasure(
      aggregator,
      dhisApi,
      query,
      {
        ...builderConfig,
        dataServices,
      },
      entity,
    );
  };
  await Promise.all(Object.entries(measureBuilders).map(addResponse));

  return responses;
};

export const mapMeasureValuesToGroups = (measureValue, dataElementGroupCode, groups) => {
  const { [dataElementGroupCode]: originalValue } = measureValue;
  const valueGroup = Object.entries(groups).find(([groupName, groupConfig]) => {
    const groupCheck = OPERATOR_TO_VALUE_CHECK[groupConfig.operator];
    if (!groupCheck) {
      throw new Error(`No function defined for operator: ${groupConfig.operator}`);
    }
    return groupCheck(originalValue, groupConfig.value);
  });

  return {
    ...measureValue,
    originalValue,
    [dataElementGroupCode]: valueGroup ? valueGroup[0] : originalValue,
  };
};

export const mapMeasureDataToCountries = data => {
  const dataMappedToCountry = data.map(async res => {
    const resultEntity = await Entity.findOne({ code: res.organisationUnitCode });
    if (!resultEntity) {
      throw new Error(
        `Could not find entity with code: ${res.organisationUnitCode} for result: ${inspect(
          res,
          false,
          null,
          true,
        )}.`,
      );
    }

    return { ...res, organisationUnitCode: resultEntity.country_code };
  });

  return Promise.all(dataMappedToCountry);
};

export const analyticsToMeasureData = (analytics, customDataKey) =>
  analytics.map(({ organisationUnit, dataElement, value }) => ({
    organisationUnitCode: organisationUnit,
    [customDataKey || dataElement]: value,
  }));
