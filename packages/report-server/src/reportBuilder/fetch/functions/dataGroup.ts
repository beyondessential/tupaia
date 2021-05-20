/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { FetchReportQuery, AggregationObject } from '../../../types';
import { FetchResponse } from '../types';

type DataGroupParams = {
  dataGroups: unknown;
  dataElements: undefined;
  aggregations?: unknown;
};

type DataGroupFetchParams = {
  dataGroupCode: string;
  dataElementCodes?: string[];
  aggregations?: (string | AggregationObject)[];
};

const fetchEvents = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataGroupFetchParams,
): Promise<FetchResponse> => {
  const { dataGroupCode, dataElementCodes, aggregations } = params;
  const { organisationUnitCodes, hierarchy, period, startDate, endDate } = query;
  const response = await aggregator.fetchEvents(
    dataGroupCode,
    aggregations,
    organisationUnitCodes,
    hierarchy,
    {
      period,
      startDate,
      endDate,
    },
    dataElementCodes,
  );
  const rows = response.map(event => {
    const { dataValues, ...restOfEvent } = event;
    return { ...dataValues, ...restOfEvent };
  });
  return {
    results: rows,
  };
};

const buildParams = (params: DataGroupParams): DataGroupFetchParams => {
  const { dataGroups, dataElements, aggregations } = params;

  validateDataGroups(dataGroups);
  validateDataElements(dataElements);
  validateAggregations(aggregations);

  return {
    dataGroupCode: dataGroups[0],
    dataElementCodes: dataElements,
    aggregations,
  };
};

function validateDataGroups(dataGroups: unknown): asserts dataGroups is [string] {
  if (!Array.isArray(dataGroups)) {
    throw new Error(`Expected an array with a single data group code but got ${dataGroups}`);
  }
  if (dataGroups.length > 1) {
    throw new Error('Expected just a single data group code');
  }
  const [dataGroupCode] = dataGroups;
  if (typeof dataGroupCode !== 'string') {
    throw new Error(`Expected the data group code to be a string, but got ${dataGroupCode}`);
  }
}

function validateDataElements(dataElements: unknown): asserts dataElements is undefined | string[] {
  if (dataElements !== undefined && !Array.isArray(dataElements)) {
    throw new Error(`Expected the data element codes to be an array, but got ${dataElements}`);
  }
  if (dataElements !== undefined && !dataElements.every(de => typeof de === 'string')) {
    throw new Error('Expected data element codes to be an array of strings');
  }
}

function validateAggregations(
  aggregations: unknown,
): asserts aggregations is undefined | (string | AggregationObject)[] {
  if (aggregations === undefined) {
    return;
  }

  if (!Array.isArray(aggregations)) {
    throw new Error(`Expected an array of aggregations but got ${aggregations}`);
  }

  aggregations.forEach(aggregation => {
    if (typeof aggregation === 'string') {
      return;
    }

    if (typeof aggregation === 'object') {
      return;
    }

    throw new Error(
      'Expected all aggregations to be either a string, or { type: string, config: object }',
    );
  });
}
export const buildDataGroupFetch = (params: DataGroupParams) => {
  const builtDataGroupsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchEvents(aggregator, query, builtDataGroupsFetchParams);
};
