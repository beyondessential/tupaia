/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { stripFields } from '@tupaia/utils';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import { AggregationList, Analytic, AnalyticCluster, FetchOptions, Indicator } from '../../types';
import { Builder } from '../Builder';
import { createBuilder } from '../createBuilder';
import { fetchAnalytics, validateConfig } from '../helpers';
import {
  ArithmeticConfig,
  configValidators,
  DefaultValue,
  getAggregationListByCode,
} from './config';

/**
 * Config used by the builder. It is essential a fully expanded, verbose version
 * of the indicator config passed in by the user (`ArithmeticConfig`)
 */
type BuilderConfig = {
  readonly formula: string;
  readonly aggregation: Record<string, AggregationList>;
  readonly parameters: Indicator[];
  readonly defaultValues: Record<string, DefaultValue>;
};

const indicatorToBuilderConfig = (indicatorConfig: ArithmeticConfig): BuilderConfig => {
  const { defaultValues = {}, parameters = [], ...otherFields } = indicatorConfig;

  return {
    ...otherFields,
    defaultValues,
    parameters,
    aggregation: getAggregationListByCode(indicatorConfig),
  };
};

export class ArithmeticBuilder extends Builder {
  private configCache: BuilderConfig | null = null;

  private paramBuildersByCodeCache: Record<string, Builder> | null = null;

  private get config() {
    if (!this.configCache) {
      const config = this.validateConfig();
      this.configCache = indicatorToBuilderConfig(config);
    }
    return this.configCache;
  }

  private get paramBuildersByCode() {
    if (!this.paramBuildersByCodeCache) {
      this.paramBuildersByCodeCache = Object.fromEntries(
        this.config.parameters.map(param => [param.code, createBuilder(this.api, param)]),
      );
    }
    return this.paramBuildersByCodeCache;
  }

  private get paramBuilders() {
    return Object.values(this.paramBuildersByCode);
  }

  validateConfig = () => {
    const { config } = this.indicator;
    validateConfig<ArithmeticConfig>(config, configValidators);
    return config;
  };

  buildAnalyticValues = async (fetchOptions: FetchOptions) => {
    const analytics = await this.fetchAnalytics(fetchOptions);
    const clusters = this.buildAnalyticClusters(analytics);
    return this.buildAnalyticValuesFromClusters(clusters);
  };

  private getVariables = () => Object.keys(this.config.aggregation);

  private fetchAnalytics = async (fetchOptions: FetchOptions) => {
    const formulaAnalytics = await fetchAnalytics(
      this.api.getAggregator(),
      stripFields(this.config.aggregation, Object.keys(this.paramBuildersByCode)),
      fetchOptions,
    );
    const parameterAnalytics = await this.api.buildAnalyticsForBuilders(
      this.paramBuilders,
      fetchOptions,
    );

    return formulaAnalytics.concat(parameterAnalytics);
  };

  private buildAnalyticClusters = (analytics: Analytic[]) => {
    const { defaultValues } = this.config;
    const variables = this.getVariables();

    const checkClusterIncludesAllVariables = (cluster: AnalyticCluster) =>
      variables.every(variable => variable in cluster.dataValues);

    const replaceAnalyticValuesWithDefaults = (cluster: AnalyticCluster) => {
      const dataValues = { ...cluster.dataValues };
      Object.keys(defaultValues).forEach(code => {
        dataValues[code] = dataValues[code] ?? defaultValues[code];
      });
      return { ...cluster, dataValues };
    };

    const clusters = analyticsToAnalyticClusters(analytics);
    // Remove clusters that do not include all specified elements
    return clusters.map(replaceAnalyticValuesWithDefaults).filter(checkClusterIncludesAllVariables);
  };

  buildAnalyticValuesFromClusters = (analyticClusters: AnalyticCluster[]) => {
    const parser = getExpressionParserInstance();
    const calculateValue = (dataValues: Record<string, number>) => {
      parser.setScope(dataValues);
      const value = parser.evaluateToNumber(this.config.formula);
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
}
