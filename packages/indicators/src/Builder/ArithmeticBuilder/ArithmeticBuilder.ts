/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { getUniqueEntries } from '@tupaia/utils';
import { AnalyticsRepository } from '../../AnalyticsRepository';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import { Aggregation, Analytic, AnalyticCluster, FetchOptions, Indicator } from '../../types';
import { Builder } from '../Builder';
import { createBuilder } from '../createBuilder';
import { getElementCodesForBuilders } from '../utils';
import {
  ArithmeticConfig,
  DefaultValue,
  configValidators,
  getAggregationsByCode,
  isParameterCode,
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

const indicatorToBuilderConfig = (indicatorConfig: ArithmeticConfig): BuilderConfig => {
  const { defaultValues = {}, parameters = [], ...otherFields } = indicatorConfig;

  return {
    ...otherFields,
    defaultValues,
    parameters,
    aggregation: getAggregationsByCode(indicatorConfig),
  };
};

export class ArithmeticBuilder extends Builder {
  private configCache: BuilderConfig | null = null;

  get config() {
    if (!this.configCache) {
      const config = this.validateConfig<ArithmeticConfig>(configValidators);
      this.configCache = indicatorToBuilderConfig(config);
    }
    return this.configCache;
  }

  getElementCodes = (): string[] => {
    const codesInFormula = this.getElementCodesInFormula();
    const codesInParameters = this.getElementCodesInParameters();
    return getUniqueEntries(codesInParameters.concat(codesInFormula));
  };

  private getElementCodesInFormula = () =>
    Object.keys(this.config.aggregation).filter(
      variable => !isParameterCode(this.config.parameters, variable),
    );

  private getElementCodesInParameters = () => {
    const parameterBuilders = this.config.parameters.map(p => createBuilder(p));
    return getElementCodesForBuilders(parameterBuilders);
  };

  getAggregations = (): Aggregation[] => {
    const formulaAggregations = Object.values(this.config.aggregation).flat();
    const parameterAggregations = this.config.parameters
      .map(p => createBuilder(p).getAggregations())
      .flat();

    return formulaAggregations.concat(parameterAggregations);
  };

  buildAnalyticValues(
    populatedAnalyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    fetchOptions: FetchOptions,
  ) {
    const analytics = this.buildAggregatedAnalytics(
      populatedAnalyticsRepo,
      buildersByIndicator,
      fetchOptions,
    );
    const clusters = this.buildAnalyticClusters(analytics);
    return this.buildAnalyticValuesFromClusters(clusters);
  }

  private getVariables = () => Object.keys(this.config.aggregation);

  /**
   * We use the provided analytics repo (pre-populated ) and builders for nested indicators
   * to build analytics for the following categories of variables included in the formula:
   *
   * a. Parameters (they take precedence over other elements with clashing codes)
   * b. Nested indicators
   * c. "Primitive" elements (eg `dhis`, `tupaia` elements)
   */
  private buildAggregatedAnalytics = (
    populatedAnalyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    fetchOptions: FetchOptions,
  ) =>
    this.getVariables()
      .map(variable => {
        const analytics = this.getAnalyticsForVariable(
          variable,
          populatedAnalyticsRepo,
          buildersByIndicator,
          fetchOptions,
        );
        const aggregations = this.config.aggregation[variable];
        return this.isRoot
          ? populatedAnalyticsRepo.aggregateRootAnalytics(analytics, aggregations)
          : populatedAnalyticsRepo.aggregateNestedAnalytics(analytics, aggregations);
      })
      .flat();

  private getAnalyticsForVariable = (
    variable: string,
    populatedAnalyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    fetchOptions: FetchOptions,
  ) => {
    const { parameters } = this.config;
    const buildAnalyticsUsingBuilder = (builder: Builder) =>
      builder.buildAnalytics(populatedAnalyticsRepo, buildersByIndicator, fetchOptions);

    if (isParameterCode(parameters, variable)) {
      const parameter = parameters.find(p => p.code === variable) as Indicator;
      return buildAnalyticsUsingBuilder(createBuilder(parameter));
    }

    const isIndicatorCode = variable in buildersByIndicator;
    if (isIndicatorCode) {
      return buildAnalyticsUsingBuilder(buildersByIndicator[variable]);
    }

    return populatedAnalyticsRepo.getAnalyticsForDataElement(variable);
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
