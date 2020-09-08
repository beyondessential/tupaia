/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables, runArithmetic } from '@beyondessential/arithmetic';

import { Aggregator } from '@tupaia/aggregator';
import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import { hasContent, isAString, isPlainObject } from '@tupaia/utils';
import { getAggregationsByCode, fetchAnalytics, validateConfig } from './helpers';
import { AnalyticCluster, Builder, AggregationSpecs, FetchOptions } from '../types';

export type DefaultValuesSpecs = Readonly<Record<string, number>>;

export type ArithmeticConfig = {
  readonly formula: string;
  readonly aggregation: AggregationSpecs;
  readonly defaultValues?: DefaultValuesSpecs;
};

const assertAggregationIsDefinedForCodesInFormula = (
  aggregation: AggregationSpecs,
  { formula }: { formula: ArithmeticConfig['formula'] },
) => {
  getVariables(formula).forEach(code => {
    if (!(code in aggregation)) {
      throw new Error(`'${code}' is referenced in the formula but has no aggregation defined`);
    }
  });
};

const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [hasContent, isPlainObject, assertAggregationIsDefinedForCodesInFormula],
};

const fetchAnalyticClusters = async (
  aggregator: Aggregator,
  aggregationSpecs: AggregationSpecs,
  defaultValues: DefaultValuesSpecs,
  fetchOptions: FetchOptions,
) => {
  const aggregationsByCode = getAggregationsByCode(aggregationSpecs);
  const analytics = await fetchAnalytics(aggregator, aggregationsByCode, fetchOptions);
  const clusters = analyticsToAnalyticClusters(analytics);

  const allElements = Object.keys(aggregationsByCode);
  const checkClusterIncludesAllElements = (cluster: AnalyticCluster) =>
    allElements.every(member => member in cluster.dataValues);

  const replaceAnalyticValuesWithDefaults = (cluster: AnalyticCluster) => {
    const returnDataValues = cluster.dataValues;
    Object.keys(defaultValues).forEach(code => {
      returnDataValues[code] = returnDataValues[code] || defaultValues[code];
    });

    return {
      ...cluster,
      dataValues: returnDataValues,
    };
  };

  // Remove clusters that do not include all elements referenced in the specs
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

export const buildArithmetic: Builder = async input => {
  const { aggregator, config: configInput, fetchOptions } = input;
  const config = await validateConfig<ArithmeticConfig>(configInput, configValidators);

  const { formula, aggregation: aggregationSpecs, defaultValues = {} } = config;
  const clusters = await fetchAnalyticClusters(
    aggregator,
    aggregationSpecs,
    defaultValues,
    fetchOptions,
  );
  return buildAnalyticValues(clusters, formula);
};
