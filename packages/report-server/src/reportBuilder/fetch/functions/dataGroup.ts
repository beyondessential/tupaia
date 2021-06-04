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
  dataGroupCodes: string[];
  dataElementCodes?: string[];
  aggregations?: (string | AggregationObject)[];
};

const fetchEvents = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataGroupFetchParams,
): Promise<FetchResponse> => {
  const { dataGroupCodes, dataElementCodes, aggregations } = params;
  const { organisationUnitCodes, hierarchy, period, startDate, endDate } = query;
  // TODO: Eventually we want Aggregator to handle fetching multiple dataGroups
  const results = await Promise.all(
    dataGroupCodes.map(async dataGroupCode => {
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
      return response.map(event => {
        const { dataValues, ...restOfEvent } = event;
        return { ...dataValues, ...restOfEvent };
      });
    }),
  );

  return {
    results: results.flat(),
  };
};

const buildParams = (params: DataGroupParams): DataGroupFetchParams => {
  const { dataGroups, dataElements, aggregations } = params;

  validateDataGroups(dataGroups);
  validateDataElements(dataElements);
  validateAggregations(aggregations);

  return {
    dataGroupCodes: dataGroups,
    dataElementCodes: dataElements,
    aggregations,
  };
};

export const buildDataGroupFetch = (params: DataGroupParams) => {
  const builtDataGroupsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchEvents(aggregator, query, builtDataGroupsFetchParams);
};
