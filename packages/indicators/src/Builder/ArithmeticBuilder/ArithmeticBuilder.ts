/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { getUniqueEntries } from '@tupaia/utils';
import { AnalyticsRepository } from '../../AnalyticsRepository';
import { getExpressionParserInstance } from '../../getExpressionParserInstance';
import { Aggregation, AggregationList, Analytic, AnalyticCluster, Indicator } from '../../types';
import { Builder } from '../Builder';
import { createBuilder } from '../createBuilder';
import { validateConfig } from '../helpers';
import { getElementCodesForBuilders } from '../utils';
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

  get config() {
    if (!this.configCache) {
      const config = this.validateConfig();
      this.configCache = indicatorToBuilderConfig(config);
    }
    return this.configCache;
  }

  get paramBuildersByCode() {
    if (!this.paramBuildersByCodeCache) {
      this.paramBuildersByCodeCache = Object.fromEntries(
        this.config.parameters.map(p => [p.code, createBuilder(p)]),
      );
    }
    return this.paramBuildersByCodeCache;
  }

  validateConfig = () => {
    const { config } = this.indicator;
    validateConfig<ArithmeticConfig>(config, configValidators);
    return config;
  };

  getElementCodes = (): string[] => {
    const codesInFormula = this.getElementCodesInFormula();
    const codesInParameters = this.getElementCodesInParameters();
    return getUniqueEntries([...codesInParameters, ...codesInFormula]);
  };

  private getElementCodesInFormula = () =>
    Object.keys(this.config.aggregation).filter(variable => !this.paramBuildersByCode[variable]);

  private getElementCodesInParameters = () =>
    getElementCodesForBuilders(Object.values(this.paramBuildersByCode));

  getAggregationListsByElement = () => {
    const listsByElement: Record<string, AggregationList[]> = {};

    Object.entries(this.config.aggregation).forEach(([variable, list]) => {
      const paramBuilder = this.paramBuildersByCode[variable];
      const newListsByElement = paramBuilder
        ? paramBuilder.getAggregationListsByElement()
        : { [variable]: [list] };

      Object.entries(newListsByElement).forEach(([k, newLists]) => {
        listsByElement[k] = [...(listsByElement[k] || []), ...newLists];
      });
    });

    return listsByElement;
  };

  buildAnalyticValues(
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    wrapperAggregations: Aggregation[],
  ) {
    const analytics = this.buildAggregatedAnalytics(
      analyticsRepo,
      buildersByIndicator,
      wrapperAggregations,
    );
    const clusters = this.buildAnalyticClusters(analytics);
    return this.buildAnalyticValuesFromClusters(clusters);
  }

  private getVariables = () => Object.keys(this.config.aggregation);

  /**
   * We use the provided analytics repo and builders for nested indicators
   * to build analytics for the following categories of variables included in the formula:
   *
   * a. Parameters (they take precedence over other elements with clashing codes)
   * b. Nested indicators
   * c. "Primitive" elements (eg `dhis`, `tupaia` elements)
   */
  private buildAggregatedAnalytics = (
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    wrapperAggregations: Aggregation[],
  ) =>
    this.getVariables()
      .map(variable => {
        const aggregationList = [...this.config.aggregation[variable], ...wrapperAggregations];
        return this.getAggregatedAnalyticsForVariable(
          variable,
          analyticsRepo,
          buildersByIndicator,
          aggregationList,
        );
      })
      .flat();

  private getAggregatedAnalyticsForVariable = (
    variable: string,
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    aggregationList: AggregationList,
  ) => {
    const buildAnalyticsUsingBuilder = (builder: Builder) =>
      builder.buildAnalytics(analyticsRepo, buildersByIndicator, aggregationList);

    const paramBuilder = this.paramBuildersByCode[variable];
    if (paramBuilder) {
      return buildAnalyticsUsingBuilder(paramBuilder);
    }

    const isIndicatorCode = variable in buildersByIndicator;
    if (isIndicatorCode) {
      return buildAnalyticsUsingBuilder(buildersByIndicator[variable]);
    }

    return analyticsRepo.getAggregatedAnalytics(variable, aggregationList);
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
