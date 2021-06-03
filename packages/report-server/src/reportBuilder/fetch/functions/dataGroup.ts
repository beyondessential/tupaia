/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../../../aggregator';
import { FetchReportQuery, AggregationObject } from '../../../types';
import { FetchResponse } from '../types';
import {
  validateDataGroups,
  validateDataElementsForEvents as validateDataElements,
  validateAggregations,
} from './helpers';

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

export const buildDataGroupFetch = (params: DataGroupParams) => {
  const builtDataGroupsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchEvents(aggregator, query, builtDataGroupsFetchParams);
};
