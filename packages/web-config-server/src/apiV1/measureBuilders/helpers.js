import { inspect } from 'util';
import { periodToMoment } from '@tupaia/tsutils';
import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { getMeasureBuilder } from './getMeasureBuilder';

export const fetchComposedData = async (models, aggregator, dhisApi, query, config, entity) => {
  const { measureBuilders, dataServices } = config || {};
  if (!measureBuilders) {
    throw new Error('Measure builders not provided');
  }

  const responses = {};
  const addResponse = async ([builderKey, builderData]) => {
    const { measureBuilder: builderName, measureBuilderConfig: builderConfig } = builderData;
    const buildMeasure = getMeasureBuilder(builderName);
    responses[builderKey] = await buildMeasure(
      models,
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
  const valueGroup = Object.entries(groups).find(([groupName, groupConfig]) =>
    checkValueSatisfiesCondition(originalValue, groupConfig),
  );

  return {
    ...measureValue,
    originalValue,
    [dataElementGroupCode]: valueGroup ? valueGroup[0] : originalValue,
  };
};

export const mapMeasureDataToCountries = async (models, data) => {
  const dataMappedToCountry = data.map(async res => {
    const resultEntity = await models.entity.findOne({ code: res.organisationUnitCode });
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
  analytics.map(({ organisationUnit, dataElement, value, period }) => ({
    organisationUnitCode: organisationUnit,
    [customDataKey || dataElement]: value,
    submissionDate: periodToMoment(period.toString()).format('YYYY-MM-DD'),
  }));
