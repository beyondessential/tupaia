/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { getUniqueEntries } from '@tupaia/utils';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import {
  Aggregation,
  Analytic,
  AnalyticCluster,
  Builder,
  FetchOptions,
  Indicator,
  IndicatorApiInterface,
} from '../../types';
import { fetchAnalytics } from '../helpers';
import {
  ArithmeticConfig,
  DefaultValue,
  getAggregationsByCode,
  validateArithmeticConfig,
} from './config';

/**
 * Config used by the builder. It is essential a fully expanded, verbose version
 * of the indicator config passed in by the user (`ArithmeticConfig`)
 */
type BuilderConfig = {
  readonly formula: string;
  readonly aggregation: Record<string, Aggregation[]>;
  readonly parameters: Indicator[];
  readonly defaultValues: Record<string, DefaultValue>;
};

const arithmeticToBuilderConfig = (config: ArithmeticConfig): BuilderConfig => {
  const { defaultValues = {}, parameters = [], ...otherFields } = config;

  return {
    ...otherFields,
    defaultValues,
    parameters,
    aggregation: getAggregationsByCode(config),
  };
};

const buildAnalyticClusters = (
  analytics: Analytic[],
  dataElements: string[],
  defaultValues: Record<string, DefaultValue>,
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

  // Remove clusters that do not include all specified elements
  const clusters = analyticsToAnalyticClusters(analytics);
  return clusters.map(replaceAnalyticValuesWithDefaults).filter(checkClusterIncludesAllElements);
};

const buildAnalyticValues = (analyticClusters: AnalyticCluster[], formula: string) => {
  const parser = getExpressionParserInstance();
  const calculateValue = (dataValues: Record<string, number>) => {
    parser.setScope(dataValues);
    const value = parser.evaluateToNumber(formula);
    parser.clearScope();
    return value;
  };

  return analyticClusters
    .map(({ organisationUnit, period, dataValues }) => ({
      organisationUnit,
      period,
      value: calculateValue(dataValues),
    }))
    .filter(({ value }) => isFinite(value));
};

const fetchAnalyticsAndElements = async (
  api: IndicatorApiInterface,
  config: BuilderConfig,
  fetchOptions: FetchOptions,
) => {
  const { aggregation, parameters } = config;

  const aggregator = api.getAggregator();
  const formulaAnalytics = await fetchAnalytics(aggregator, aggregation, fetchOptions);
  const formulaElements = Object.keys(aggregation);

  const parameterAnalytics = await api.buildAnalyticsForIndicators(parameters, fetchOptions);
  const parameterElements = parameters.map(p => p.code);

  return {
    analytics: formulaAnalytics.concat(parameterAnalytics),
    dataElements: getUniqueEntries(formulaElements.concat(parameterElements)),
  };
};

export const processConfigInput = (config: Record<string, unknown>) => {
  validateArithmeticConfig(config);
  return arithmeticToBuilderConfig(config);
};

export const buildArithmetic: Builder = async input => {
  const { api, fetchOptions } = input;
  const config = processConfigInput(input.config);
  const { analytics, dataElements } = await fetchAnalyticsAndElements(api, config, fetchOptions);
  const clusters = buildAnalyticClusters(analytics, dataElements, config.defaultValues);
  return buildAnalyticValues(clusters, config.formula);
};
