/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { isNotNullish } from '@tupaia/tsutils';
import { DEFAULT_BINARY_OPTIONS, yup } from '@tupaia/utils';
import groupBy from 'lodash.groupby';
import { DataBrokerModelRegistry, DataGroup, DataSource } from '../../types';
import { PullMetadataOptions } from '../Service';

const sanitizeMetadataValue = (value: string, type: string) => {
  switch (type) {
    case 'Number': {
      const sanitizedValue = parseFloat(value);
      return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
    }
    case 'Binary':
    case 'Checkbox':
      return value === 'Yes' ? 1 : 0;
    default:
      return value;
  }
};

const buildOptionsMetadata = (
  options: (string | { value: string; label: string | undefined })[] = [],
  type: string,
) => {
  const optionList = options.length === 0 && type === 'Binary' ? DEFAULT_BINARY_OPTIONS : options;

  if (!optionList.length) {
    return undefined;
  }

  const optionsMetadata: Record<string, string> = {};
  const optionsObjectValidator = yup.object({
    value: yup.string().required(),
    label: yup.string(),
  });

  optionList.forEach(option => {
    if (typeof option !== 'string') {
      const { value, label } = option;
      optionsMetadata[sanitizeMetadataValue(value, type)] = label || value;
      return;
    }

    try {
      // options coming from question.options are JSON format strings
      // options coming from option_set are actual JSON objects
      const optionObject = optionsObjectValidator.validateSync(JSON.parse(option));
      const { value, label } = optionObject;
      optionsMetadata[sanitizeMetadataValue(value, type)] = label || value;
    } catch (error) {
      // Exception is thrown when option is a plain string
      optionsMetadata[sanitizeMetadataValue(option, type)] = option;
    }
  });

  return optionsMetadata;
};

export const pullDataElementMetadataFromTupaiaSurveys = async (
  models: DataBrokerModelRegistry,
  dataSources: DataSource[],
  pullOptions: PullMetadataOptions,
) => {
  if (dataSources.length < 1) {
    throw new Error('Please provide an array of data element codes');
  }

  const questions = await models.question.find({
    code: dataSources.map(({ code }) => code),
  });

  if (!pullOptions.includeOptions) {
    return questions.map(({ code, name }) => ({ code, name }));
  }

  // Get all possible option_set_ids from questions
  const optionSetIds = [...new Set(questions.map(q => q.option_set_id).filter(isNotNullish))];
  // Get all the options from the option sets and grouped by set ids.
  const optionOfAllOptionSets = await models.option.find({ option_set_id: optionSetIds });
  const optionsGroupedBySetId = groupBy(optionOfAllOptionSets, 'option_set_id');

  return questions.map(({ code, name, type: questionType, options, option_set_id }) => {
    const optionSetOptions = option_set_id ? optionsGroupedBySetId[option_set_id] : [];
    const allOptions = [...options, ...optionSetOptions];
    const builtOptions = buildOptionsMetadata(allOptions, questionType);
    if (builtOptions) {
      return { code, name, options: builtOptions };
    }

    return { code, name };
  });
};

export const pullDataGroupMetadataFromTupaiaSurveys = async (
  models: DataBrokerModelRegistry,
  dataSources: DataGroup[],
  options: PullMetadataOptions,
) => {
  if (dataSources.length > 1) {
    throw new Error('Cannot pull metadata from data groups at the same time');
  }

  if (dataSources.length < 1 || !dataSources[0].code) {
    throw new Error('Please provide a data group code');
  }

  const [dataSource] = dataSources;
  const { code: dataGroupCode, service_type: serviceType } = dataSource;

  const survey = await models.survey.findOne({ code: dataGroupCode });
  const dataElements = await models.dataGroup.getDataElementsInDataGroup(dataGroupCode);

  if (dataElements.length === 0) {
    return { name: survey.name, code: survey.code };
  }

  const dataElementDataSources: DataSource[] = dataElements.map(({ code, config }) => ({
    code,
    service_type: serviceType,
    config,
  }));
  const dataElementsMetadata = await pullDataElementMetadataFromTupaiaSurveys(
    models,
    dataElementDataSources,
    options,
  );

  return { name: survey.name, code: survey.code, dataElements: dataElementsMetadata };
};
