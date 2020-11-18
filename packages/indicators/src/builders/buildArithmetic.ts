/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables, runArithmetic } from '@beyondessential/arithmetic';

import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import {
  allValuesAreNumbers,
  constructIsEmptyOr,
  constructIsOneOfType,
  hasContent,
  isAString,
} from '@tupaia/utils';
import { getAggregationsByCode, fetchAnalytics, validateConfig } from './helpers';
import {
  AggregationSpecs,
  Analytic,
  AnalyticCluster,
  Builder,
  FetchOptions,
  IndicatorApiInterface,
} from '../types';

export type DefaultValuesSpecs = Readonly<Record<string, number>>;

export type ArithmeticConfig = {
  readonly formula: string;
  readonly aggregation: AggregationSpecs;
  readonly defaultValues?: DefaultValuesSpecs;
};

const assertAggregationObjectIsValid = (
  aggregation: string | Record<string, unknown>,
  { formula }: { formula: string },
) => {
  if (typeof aggregation === 'string') {
    return;
  }

  getVariables(formula).forEach(code => {
    if (!(code in aggregation)) {
      throw new Error(`'${code}' is referenced in the formula but has no aggregation defined`);
    }
  });
};

const assertAllDefaultsAreCodesInFormula = (
  defaultValues: DefaultValuesSpecs,
  { formula }: { formula: string },
) => {
  const variables = getVariables(formula);
  Object.keys(defaultValues).forEach(code => {
    if (!variables.includes(code)) {
      throw new Error(`'${code}' is in defaultValues but not referenced in the formula`);
    }
  });
};

const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [
    hasContent,
    constructIsOneOfType(['string', 'object']),
    assertAggregationObjectIsValid,
  ],
  defaultValues: [
    constructIsEmptyOr(assertAllDefaultsAreCodesInFormula),
    constructIsEmptyOr(allValuesAreNumbers),
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

const fetchAnalyticsAndElements = async (
  api: IndicatorApiInterface,
  config: ArithmeticConfig,
  fetchOptions: FetchOptions,
) => {
  const { formula, aggregation: aggregationSpecs } = config;
  const aggregator = api.getAggregator();
  const aggregationsByCode = getAggregationsByCode(aggregationSpecs, formula);
  const analytics = await fetchAnalytics(aggregator, aggregationsByCode, fetchOptions);
  const dataElements = Object.keys(aggregationsByCode);

  return { analytics, dataElements };
};

export const buildArithmetic: Builder = async input => {
  const { api, config: configInput, fetchOptions } = input;
  const config = await validateConfig<ArithmeticConfig>(configInput, configValidators);
  const { analytics, dataElements } = await fetchAnalyticsAndElements(api, config, fetchOptions);

  const { formula, defaultValues = {} } = config;
  const clusters = await fetchAnalyticClusters(analytics, dataElements, defaultValues);
  return buildAnalyticValues(clusters, formula);
};
