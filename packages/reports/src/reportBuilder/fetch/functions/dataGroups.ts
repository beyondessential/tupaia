import { Aggregator } from '../../../aggregator';
import { FetchReportQuery } from '../../../routes/types';
import { FetchResponse } from '../types';
import { Row } from '../../types';

type DataGroupsFetchParams = {
  programCode: string;
};

const fetchEvents = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: DataGroupsFetchParams,
): Promise<FetchResponse> => {
  const { programCode } = params;
  const { organisationUnitCode, startDate, endDate } = query;
  const response = (await aggregator.fetchEvents(
    programCode,
    {
      useDeprecatedApi: false,
      dataServices: { isDataRegional: true },
      organisationUnitCodes: [organisationUnitCode],
      startDate,
      endDate,
    },
    {},
  )) as Row[];
  response.forEach(row => {
    Object.entries(row.dataValues).forEach(([key, value]) => {
      row[key] = value;
    });
    delete row.dataValues;
  });
  return {
    results: response,
  };
};

const buildParams = (params: unknown): DataGroupsFetchParams => {
  if (!Array.isArray(params)) {
    throw new Error(`Expected params object but got ${params}`);
  }

  if (params.length > 1) {
    throw new Error(`Expected just a single program code`);
  }

  return {
    programCode: params[0],
  };
};

export const buildDataGroupsFetch = (params: unknown) => {
  const builtDataGroupsFetchParams = buildParams(params);
  return (aggregator: Aggregator, query: FetchReportQuery) =>
    fetchEvents(aggregator, query, builtDataGroupsFetchParams);
};
