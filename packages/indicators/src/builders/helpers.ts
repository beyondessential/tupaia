/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import { Aggregator } from '@tupaia/aggregator';
import { Aggregation, AggregationSpecs, Analytic, FetchOptions } from '../types';

const FORMULA_SYMBOLS = ['(', ')', '+', '-', '*', '/'];

export const extractDataElementCodesFromFormula = (formula: string) => {
  const regex = `[${FORMULA_SYMBOLS.map(s => `\\${s}`).join('')}]`;
  const codes = formula
    .replace(new RegExp(regex, 'g'), '')
    .split(' ')
    .filter(c => c !== '');

  return new Set(codes);
};

export const getAggregationsByCode = (aggregationSpecs: AggregationSpecs) =>
  Object.fromEntries(
    Object.entries(aggregationSpecs).map(([code, descriptor]) => {
      const descriptorArray = Array.isArray(descriptor) ? descriptor : [descriptor];
      const aggregations = descriptorArray.map(aggregationType => ({ type: aggregationType }));
      return [code, aggregations];
    }),
  );

export const fetchAnalytics = async (
  aggregator: Aggregator,
  aggregationsByCode: Record<string, Aggregation[]>,
  fetchOptions: FetchOptions,
): Promise<Analytic[]> => {
  const aggregationJsonToCodes = groupBy(Object.keys(aggregationsByCode), code =>
    JSON.stringify(aggregationsByCode[code]),
  );

  const analytics: Analytic[] = [];
  // A different collection of aggregations may be required for each data element code,
  // but only one collection can be provided in an aggregator call
  // Group data elements per aggregation collection to minimise aggregator calls
  await Promise.all(
    Object.entries(aggregationJsonToCodes).map(async ([aggregationJson, codes]) => {
      const aggregations = JSON.parse(aggregationJson);
      const { results } = await aggregator.fetchAnalytics(codes, fetchOptions, { aggregations });
      analytics.push(...results);
    }),
  );

  return analytics;
};
