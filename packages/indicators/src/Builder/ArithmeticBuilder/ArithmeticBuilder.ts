/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { ExpressionParser } from '@tupaia/expression-parser';
import { getUniqueEntries } from '@tupaia/utils';
import { Analytic, AnalyticCluster, FetchOptions } from '../../types';
import { Builder } from '../Builder';
import { fetchAnalytics } from '../helpers';
import {
  ArithmeticConfig,
  configValidators,
  expandConfig,
  ExpandedArithmeticConfig,
} from './config';

const buildAnalyticClusters = (
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

const buildAnalyticValuesFromClusters = (analyticClusters: AnalyticCluster[], formula: string) => {
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

export class ArithmeticBuilder extends Builder {
  async buildAnalyticValues(configInput: Record<string, unknown>, fetchOptions: FetchOptions) {
    const config = await this.processConfig(configInput);
    const { analytics, dataElements } = await this.fetchAnalyticsAndElements(config, fetchOptions);
    const clusters = buildAnalyticClusters(analytics, dataElements, config.defaultValues);
    return buildAnalyticValuesFromClusters(clusters, config.formula);
  }

  private processConfig = async (configInput: Record<string, unknown>) => {
    const config = await this.validateConfig<ArithmeticConfig>(configInput, configValidators);
    return expandConfig(config);
  };

  private fetchAnalyticsAndElements = async (
    config: ExpandedArithmeticConfig,
    fetchOptions: FetchOptions,
  ) => {
    const { aggregation, parameters } = config;

    const aggregator = this.indicatorApi.getAggregator();
    const formulaAnalytics = await fetchAnalytics(aggregator, aggregation, fetchOptions);
    const formulaElements = Object.keys(aggregation);

    const parameterAnalytics = await this.indicatorApi.buildAnalyticsForIndicators(
      parameters,
      fetchOptions,
    );
    const parameterElements = parameters.map(p => p.code);

    return {
      analytics: formulaAnalytics.concat(parameterAnalytics),
      dataElements: getUniqueEntries(formulaElements.concat(parameterElements)),
    };
  };
}
