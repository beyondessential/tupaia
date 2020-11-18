/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables, runArithmetic } from '@beyondessential/arithmetic';

import { Aggregator } from '@tupaia/aggregator';
import { analyticsToAnalyticClusters } from '@tupaia/data-broker';
import {
  allValuesAreNumbers,
  constructIsEmptyOr,
  constructIsOneOfType,
  hasContent,
  isAString,
} from '@tupaia/utils';
import { getAggregationsByCode, fetchAnalytics, validateConfig } from './helpers';
import { Aggregation, AnalyticCluster, Builder, AggregationSpecs, FetchOptions } from '../types';

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
  aggregator: Aggregator,
  aggregationsByCode: Record<string, Aggregation[]>,
  defaultValues: DefaultValuesSpecs,
  fetchOptions: FetchOptions,
) => {
  const analytics = await fetchAnalytics(aggregator, aggregationsByCode, fetchOptions);
  const clusters = analyticsToAnalyticClusters(analytics);

  const allElements = Object.keys(aggregationsByCode);
  const checkClusterIncludesAllElements = (cluster: AnalyticCluster) =>
    allElements.every(member => member in cluster.dataValues);

  const replaceAnalyticValuesWithDefaults = (cluster: AnalyticCluster) => {
    const returnDataValues = { ...cluster.dataValues };
    Object.keys(defaultValues).forEach(code => {
      returnDataValues[code] = returnDataValues[code] ?? defaultValues[code];
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
  const aggregationsByCode = getAggregationsByCode(aggregationSpecs, formula);
  const clusters = await fetchAnalyticClusters(
    aggregator,
    aggregationsByCode,
    defaultValues,
    fetchOptions,
  );
  return buildAnalyticValues(clusters, formula);
};
