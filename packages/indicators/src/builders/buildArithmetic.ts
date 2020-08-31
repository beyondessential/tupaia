/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getVariables, runArithmetic } from '@beyondessential/arithmetic';

import { Aggregator } from '@tupaia/aggregator';
import { hasContent, isAString, isPlainObject } from '@tupaia/utils';
import { getAggregationsByCode, fetchAnalytics, validateConfig } from './helpers';
import { Analytic, Builder, AggregationSpecs, FetchOptions } from '../types';

export interface ArithmeticConfig {
  readonly [key: string]: unknown;
  readonly formula: string;
  readonly aggregation: AggregationSpecs;
}

interface AnalyticalEvent {
  organisationUnit: Analytic['organisationUnit'];
  period: Analytic['period'];
  dataValues: Record<Analytic['dataElement'], Analytic['value']>;
}

const assertAggregationIsDefinedForCodesInFormula = (
  aggregation: string,
  { formula }: { formula: ArithmeticConfig['formula'] },
) => {
  getVariables(formula).forEach(code => {
    if (!Object.keys(aggregation).includes(code)) {
      throw new Error(`'${code}' is referenced in the formula but has no aggregation defined`);
    }
  });
};

const configValidators = {
  formula: [hasContent, isAString],
  aggregation: [hasContent, isPlainObject, assertAggregationIsDefinedForCodesInFormula],
};

const analyticsToAnalyticalEvents = (analytics: Analytic[]): AnalyticalEvent[] => {
  const eventMap: Record<string, AnalyticalEvent> = {};
  analytics.forEach(analytic => {
    const { dataElement, organisationUnit, period, value } = analytic;
    const key = `${organisationUnit}__${period}`;
    if (!eventMap[key]) {
      eventMap[key] = { organisationUnit, period, dataValues: {} };
    }
    eventMap[key].dataValues[dataElement] = value;
  });

  return Object.values(eventMap);
};

const fetchAnalyticalEvents = async (
  aggregator: Aggregator,
  aggregationSpecs: AggregationSpecs,
  fetchOptions: FetchOptions,
) => {
  const aggregationsByCode = getAggregationsByCode(aggregationSpecs);
  const analytics = await fetchAnalytics(aggregator, aggregationsByCode, fetchOptions);
  const events = analyticsToAnalyticalEvents(analytics);

  const allElements = Object.keys(aggregationsByCode);
  const checkEventIncludesAllElements = (event: AnalyticalEvent) =>
    allElements.every(member => Object.keys(event.dataValues).includes(member));

  // Remove events that do not include all elements referenced in the specs
  return events.filter(checkEventIncludesAllElements);
};

const buildAnalyticValues = (analyticalEvents: AnalyticalEvent[], formula: string) =>
  analyticalEvents.map(({ organisationUnit, period, dataValues }) => ({
    organisationUnit,
    period,
    value: runArithmetic(formula, dataValues),
  }));

export const buildArithmetic: Builder = async input => {
  const { aggregator, config: configInput, fetchOptions } = input;
  const config = await validateConfig<ArithmeticConfig>(configInput, configValidators);

  const { formula, aggregation: aggregationSpecs } = config;
  const events = await fetchAnalyticalEvents(aggregator, aggregationSpecs, fetchOptions);
  return buildAnalyticValues(events, formula);
};
