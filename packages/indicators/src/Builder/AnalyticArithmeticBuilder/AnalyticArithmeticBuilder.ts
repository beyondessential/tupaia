import { groupBy } from 'es-toolkit/compat';

import { stripFields } from '@tupaia/utils';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import { AggregationList, Analytic, AnalyticCluster, FetchOptions, Indicator } from '../../types';
import { analyticsToAnalyticClusters } from '../../utils';
import { Builder } from '../Builder';
import { createBuilder } from '../createBuilder';
import {
  fetchAnalytics,
  validateConfig,
  convertBooleanToNumber,
  replaceDataValuesWithDefaults,
  isValidIndicatorValue,
} from '../helpers';
import {
  AnalyticArithmeticConfig,
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

const indicatorToBuilderConfig = (indicatorConfig: AnalyticArithmeticConfig): BuilderConfig => {
  const { defaultValues = {}, parameters = [], ...otherFields } = indicatorConfig;

  return {
    ...otherFields,
    defaultValues,
    parameters,
    aggregation: getAggregationListByCode(indicatorConfig),
  };
};

export class AnalyticArithmeticBuilder extends Builder {
  private configCache: BuilderConfig | null = null;
  private paramBuildersByCodeCache: Record<string, Builder> | null = null;

  private get config() {
    if (!this.configCache) {
      const config = this.validateConfig();
      this.configCache = indicatorToBuilderConfig(config);
    }
    return this.configCache;
  }

  private get paramBuildersByCode(): Record<string, Builder> {
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

  public validateConfig = () => {
    const { config } = this.indicator;
    validateConfig<AnalyticArithmeticConfig>(config, configValidators);
    return config;
  };

  protected buildAnalyticValues = async (fetchOptions: FetchOptions) => {
    const analytics = await this.fetchAnalytics(fetchOptions);
    const clusters = this.buildAnalyticClusters(analytics);
    return this.buildAnalyticValuesFromClusters(clusters);
  };

  private getVariables = () => Object.keys(this.config.aggregation);

  private fetchAnalytics = async (fetchOptions: FetchOptions) => {
    const formulaAnalytics = await this.fetchFormulaAnalytics(fetchOptions);
    const parameterAnalytics = await this.fetchParameterAnalytics(fetchOptions);
    return [...formulaAnalytics, ...parameterAnalytics];
  };

  private fetchFormulaAnalytics = async (fetchOptions: FetchOptions) => {
    const aggregationListByElement = stripFields(
      this.config.aggregation,
      Object.keys(this.paramBuildersByCode),
    );
    return fetchAnalytics(this.api.getAggregator(), aggregationListByElement, fetchOptions);
  };

  private fetchParameterAnalytics = async (fetchOptions: FetchOptions) => {
    const analytics = await this.api.buildAnalyticsForBuilders(this.paramBuilders, fetchOptions);
    const analyticsByElement = groupBy(analytics, 'dataElement');

    return Object.entries(analyticsByElement).flatMap(([element, analyticsForElement]) => {
      const aggregationList = this.config.aggregation[element];
      return this.api
        .getAggregator()
        .aggregateAnalytics(analyticsForElement, aggregationList, fetchOptions.period);
    });
  };

  private buildAnalyticClusters = (analytics: Analytic[]) => {
    const { defaultValues } = this.config;
    const variables = this.getVariables();

    const checkClusterIncludesAllVariables = (cluster: AnalyticCluster) =>
      variables.every(variable => variable in cluster.dataValues);

    const replaceAnalyticValuesWithDefaults = (cluster: AnalyticCluster): AnalyticCluster => ({
      ...cluster,
      dataValues: replaceDataValuesWithDefaults(cluster.dataValues, defaultValues),
    });

    const clusters: AnalyticCluster[] = analyticsToAnalyticClusters(analytics);
    // Remove clusters that do not include all specified elements
    return clusters.map(replaceAnalyticValuesWithDefaults).filter(checkClusterIncludesAllVariables);
  };

  private buildAnalyticValuesFromClusters = (analyticClusters: AnalyticCluster[]) => {
    const parser = getExpressionParserInstance();
    return analyticClusters
      .map(({ organisationUnit, period, dataValues }) => ({
        organisationUnit,
        period,
        value: convertBooleanToNumber(parser, this.config.formula, dataValues),
      }))
      .filter(({ value }) => isValidIndicatorValue(value));
  };
}
