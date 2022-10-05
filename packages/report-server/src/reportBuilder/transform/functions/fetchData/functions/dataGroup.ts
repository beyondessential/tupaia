/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { ReportServerAggregator } from '../../../../../aggregator';
import { Aggregation, FetchReportQuery } from '../../../../../types';
import { FetchConfig, FetchResponse } from '../types';

type DataGroupParams = Pick<FetchConfig, 'dataGroups' | 'dataElements' | 'aggregations'>;

const dataGroupsValidator = yup.array().of(yup.string().required()).min(1).required();

type DataGroupFetchParams = {
  dataGroupCodes: string[];
  dataElementCodes?: string[];
  aggregations?: Aggregation[];
};

const fetchEvents = async (
  aggregator: ReportServerAggregator,
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

  return {
    dataGroupCodes: dataGroupsValidator.validateSync(dataGroups),
    dataElementCodes: dataElements,
    aggregations,
  };
};

export const buildDataGroupFetch = (params: DataGroupParams) => {
  const builtDataGroupsFetchParams = buildParams(params);
  return (aggregator: ReportServerAggregator, query: FetchReportQuery) =>
    fetchEvents(aggregator, query, builtDataGroupsFetchParams);
};
