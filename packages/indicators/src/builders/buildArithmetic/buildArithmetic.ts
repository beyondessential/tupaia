/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { ExpressionParser } from '@tupaia/expression-parser';
import { getUniqueEntries } from '@tupaia/utils';
import {
  Analytic,
  AnalyticCluster,
  Builder,
  FetchOptions,
  IndicatorApiInterface,
} from '../../types';
import { fetchAnalytics } from '../helpers';
import { expandConfig, ExpandedArithmeticConfig, validateArithmeticConfig } from './config';

const fetchAnalyticClusters = async (
  analytics: Analytic[],
  dataElements: string[],
  defaultValues: Record<string, number>,
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
  const parser = new ExpressionParser();
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
  config: ExpandedArithmeticConfig,
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

export const processConfigInput = async (configInput: Record<string, unknown>) => {
  const config = await validateArithmeticConfig(configInput);
  return expandConfig(config);
};

export const buildArithmetic: Builder = async input => {
  const { api, fetchOptions } = input;
  const config = await processConfigInput(input.config);
  const { analytics, dataElements } = await fetchAnalyticsAndElements(api, config, fetchOptions);
  const clusters = await fetchAnalyticClusters(analytics, dataElements, config.defaultValues);
  return buildAnalyticValues(clusters, config.formula);
};
