/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { runArithmetic } from '@beyondessential/arithmetic';
import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { getUniqueEntries } from '@tupaia/utils';
import {
  Analytic,
  AnalyticCluster,
  Builder,
  FetchOptions,
  IndicatorApiInterface,
} from '../../types';
import { fetchAnalytics, validateConfig } from '../helpers';
import { getAggregationsByCode } from './aggregationConfig';
import { configValidators } from './configValidators';
import { ArithmeticConfig } from './types';

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

const buildAnalyticValues = (analyticClusters: AnalyticCluster[], formula: string) =>
  analyticClusters
    .map(({ organisationUnit, period, dataValues }) => ({
      organisationUnit,
      period,
      value: runArithmetic(formula, dataValues),
    }))
    .filter(({ value }) => isFinite(value));

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
