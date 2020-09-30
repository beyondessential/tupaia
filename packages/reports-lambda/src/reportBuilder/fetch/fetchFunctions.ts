import { Aggregator } from '../../aggregator';
import { FetchReportQuery } from '../../routes/fetchReport';
import { FetchResponse } from './fetch';
import { Row } from '../reportBuilder';

interface FetchFunction {
  (aggregator: Aggregator, query: FetchReportQuery, params: object): Promise<FetchResponse>;
}

const fetchAnalytics: FetchFunction = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: object,
): Promise<FetchResponse> => {
  const organisationUnitCode: string = query.organisationUnitCode;
  const {
    dataElementCodes,
    aggregationType,
  }: { dataElementCodes: string[]; aggregationType: string } = params;
  const response = (await aggregator.fetchAnalytics(
    dataElementCodes,
    {
      dataServices: [
        {
          isDataRegional: false,
        },
      ],
      organisationUnitCodes: [organisationUnitCode],
    },
    {},
    {
      aggregationType,
    },
  )) as FetchResponse;
  response.results.forEach(row => {
    row[row.dataElement] = row.value;
    delete row.dataElement;
    delete row.value;
  });
  return response;
};

const fetchEvents: FetchFunction = async (
  aggregator: Aggregator,
  query: FetchReportQuery,
  params: object,
): Promise<FetchResponse> => {
  const {
    programCode,
    dataElementCodes,
    dataServices,
    entityAggregation,
    dataSourceEntityFilter,
  } = params;
  const { organisationUnitCode, startDate, endDate, trackedEntityInstance, eventId } = query;
  const response = (await aggregator.fetchEvents(programCode, {
    useDeprecatedApi: false,
    dataServices,
    entityAggregation,
    dataSourceEntityFilter,
    organisationUnitCodes: [organisationUnitCode],
    startDate,
    endDate,
    trackedEntityInstance,
    eventId,
    dataElementCodes,
  })) as Row[];
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

export const fetchFunctions = {
  fetchAnalytics,
  fetchEvents,
};

export const isValidFetchFunction = (
  fetchFunction?: string,
): fetchFunction is keyof typeof fetchFunctions => {
  return fetchFunction !== undefined && fetchFunction in fetchFunctions;
};
