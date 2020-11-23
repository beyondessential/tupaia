/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables, runArithmetic } from '@beyondessential/arithmetic';

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import {
  allValuesAreNumbers,
  constructIsArrayOf,
  constructIsEmptyOr,
  constructIsOneOfType,
  getUniqueEntries,
  hasContent,
  isAString,
  isPlainObject,
  ObjectValidator,
  toArray,
} from '@tupaia/utils';
import { fetchAnalytics, validateConfig } from './helpers';
import {
  AggregationSpecs,
  Analytic,
  AnalyticCluster,
  Builder,
  FetchOptions,
  Indicator,
  IndicatorApiInterface,
} from '../types';

export type DefaultValuesSpecs = Readonly<Record<string, number>>;

export type ArithmeticConfig = {
  readonly formula: string;
  readonly aggregation: AggregationSpecs;
  readonly parameters?: Indicator[];
  readonly defaultValues?: DefaultValuesSpecs;
};

const isParameterCode = (parameters: { code: string }[], code: string) =>
  !!parameters.find(p => p.code === code);

const assertAggregationObjectIsValid = (
  aggregation: string | Record<string, unknown>,
  config: Pick<ArithmeticConfig, 'formula' | 'parameters'>,
) => {
  const { formula, parameters = [] } = config;
  if (typeof aggregation === 'string') {
    return;
  }

  getVariables(formula).forEach(code => {
    if (!(code in aggregation) && !isParameterCode(parameters, code)) {
      throw new Error(`'${code}' is referenced in the formula but has no aggregation defined`);
    }
  });
};

const assertAllDefaultsAreCodesInFormula = (
  defaultValues: Record<string, unknown>,
  { formula }: { formula: string },
) => {
  const variables = getVariables(formula);
  Object.keys(defaultValues).forEach(code => {
    if (!variables.includes(code)) {
      throw new Error(`'${code}' is in defaultValues but not referenced in the formula`);
    }
  });
};

const assertParametersAreValid = async (parameters: Record<string, unknown>[]) => {
  const validator = new ObjectValidator({
    code: [hasContent, isAString],
    builder: [hasContent, isAString],
    config: [isPlainObject],
  });

  const validateParameter = async (parameter: Record<string, unknown>) =>
    validator.validate(parameter);
  await Promise.all(parameters.map(validateParameter));
};

const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [
    hasContent,
    constructIsOneOfType(['string', 'object']),
    assertAggregationObjectIsValid,
  ],
  parameters: [constructIsEmptyOr([constructIsArrayOf('object'), assertParametersAreValid])],
  defaultValues: [
    constructIsEmptyOr([isPlainObject, assertAllDefaultsAreCodesInFormula, allValuesAreNumbers]),
  ],
};

const fetchAnalyticClusters = async (
  analytics: Analytic[],
  dataElements: string[],
  defaultValues: DefaultValuesSpecs,
) => {
  const checkClusterIncludesAllElements = (cluster: AnalyticCluster) =>
    dataElements.every(member => member in cluster.dataValues);

  const replaceAnalyticValuesWithDefaults = (cluster: AnalyticCluster) => {
    const returnDataValues = { ...cluster.dataValues };
    Object.keys(defaultValues).forEach(code => {
      returnDataValues[code] = returnDataValues[code] ?? defaultValues[code];
    });

    return { ...cluster, dataValues: returnDataValues };
  };

  // Remove clusters that do not include all elements referenced in the specs
  const clusters = analyticsToAnalyticClusters(analytics);
  return clusters.map(replaceAnalyticValuesWithDefaults).filter(checkClusterIncludesAllElements);
};

const buildAnalyticValues = (analyticClusters: AnalyticCluster[], formula: string) =>
  analyticClusters
    .map(({ organisationUnit, period, dataValues }) => ({
      organisationUnit,
      period,
      value: runArithmetic(formula, dataValues),
    }))
    .filter(({ value }) => isFinite(value));

const getAggregationTypesByCode = (config: ArithmeticConfig): Record<string, string | string[]> => {
  const { formula, aggregation, parameters = [] } = config;

  if (typeof aggregation === 'object') {
    return aggregation;
  }
  const elementCodes = getVariables(formula).filter(code => !isParameterCode(parameters, code));
  return Object.fromEntries(elementCodes.map(code => [code, aggregation]));
};

const getAggregationsByCode = (config: ArithmeticConfig) => {
  const aggregationTypesByCode = getAggregationTypesByCode(config);

  return Object.fromEntries(
    Object.entries(aggregationTypesByCode).map(([code, aggregationTypes]) => {
      const aggregations = toArray(aggregationTypes).map(type => ({ type }));
      return [code, aggregations];
    }),
  );
};

const fetchAnalyticsAndElements = async (
  api: IndicatorApiInterface,
  config: ArithmeticConfig,
  fetchOptions: FetchOptions,
) => {
  const { parameters = [] } = config;

  const aggregator = api.getAggregator();
  const aggregationsByCode = getAggregationsByCode(config);
  const formulaAnalytics = await fetchAnalytics(aggregator, aggregationsByCode, fetchOptions);
  const formulaElements = Object.keys(aggregationsByCode);

  const parameterAnalytics = await api.buildAnalyticsForIndicators(parameters, fetchOptions);
  const parameterElements = parameters.map(p => p.code);

  return {
    analytics: formulaAnalytics.concat(parameterAnalytics),
    dataElements: getUniqueEntries(formulaElements.concat(parameterElements)),
  };
};

export const buildArithmetic: Builder = async input => {
  const { api, config: configInput, fetchOptions } = input;
  const config = await validateConfig<ArithmeticConfig>(configInput, configValidators);
  const { analytics, dataElements } = await fetchAnalyticsAndElements(api, config, fetchOptions);

  const { formula, defaultValues = {} } = config;
  const clusters = await fetchAnalyticClusters(analytics, dataElements, defaultValues);
  return buildAnalyticValues(clusters, formula);
};
