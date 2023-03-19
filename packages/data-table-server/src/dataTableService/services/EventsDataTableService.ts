/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { Aggregator } from '@tupaia/aggregator';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataBroker } from '@tupaia/data-broker';
import { getDefaultPeriod, convertPeriodStringToDateRange, yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';
import { orderParametersByName } from '../utils';
import { mapProjectEntitiesToCountries } from './utils';

const getDefaultStartDate = () => new Date(convertPeriodStringToDateRange(getDefaultPeriod())[0]);
const getDefaultEndDate = () => new Date(convertPeriodStringToDateRange(getDefaultPeriod())[1]);

const requiredParamsSchema = yup.object().shape({
  hierarchy: yup.string().default('explore'),
  dataGroupCode: yup.string().required(),
  dataElementCodes: yup.array().of(yup.string().required()).min(1),
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup.date().default(getDefaultStartDate),
  endDate: yup.date().default(getDefaultEndDate),
  aggregations: yup.array().of(
    yup.object().shape({
      type: yup.string().required(),
      config: yup.object(),
    }),
  ),
});

const configSchema = yup.object();

type EventsDataTableServiceContext = {
  apiClient: TupaiaApiClient;
  accessPolicy: AccessPolicy;
};

type EventFields = {
  event: string;
  eventDate: string;
  orgUnit: string;
  orgUnitName: string;
};

type RawEvent = EventFields & {
  dataValues: Record<string, unknown>;
};
type Event = EventFields & Record<string, unknown>;

const getAllDataElementsInGroup = async (aggregator: Aggregator, dataGroupCode: string) => {
  const { dataElements } = (await aggregator.fetchDataGroup(dataGroupCode, {})) as {
    dataElements: { code: string }[];
  };
  return dataElements.map(({ code }) => code);
};

/**
 * DataTableService for pulling data from data-broker's fetchEvents() endpoint
 */
export class EventsDataTableService extends DataTableService<
  EventsDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  Event
> {
  protected supportsAdditionalParams = false;

  public constructor(context: EventsDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: {
    hierarchy: string;
    dataGroupCode: string;
    dataElementCodes?: string[];
    organisationUnitCodes: string[];
    startDate?: Date;
    endDate?: Date;
    aggregations?: { type: string; config?: Record<string, unknown> }[];
  }) {
    const {
      hierarchy,
      dataGroupCode,
      dataElementCodes,
      organisationUnitCodes,
      startDate,
      endDate,
      aggregations,
    } = params;

    const aggregator = new Aggregator(
      new DataBroker({
        services: this.ctx.apiClient,
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const startDateString = startDate ? startDate.toISOString() : undefined;
    const endDateString = endDate ? endDate.toISOString() : undefined;

    // Ensure that if fetching for project, we map it to the underlying countries
    const entityCodesForFetch = await mapProjectEntitiesToCountries(
      this.ctx.apiClient,
      hierarchy,
      organisationUnitCodes,
    );

    const dataElementCodesForFetch =
      dataElementCodes || (await getAllDataElementsInGroup(aggregator, dataGroupCode));

    const response = (await aggregator.fetchEvents(
      dataGroupCode,
      {
        hierarchy,
        organisationUnitCodes: entityCodesForFetch,
        startDate: startDateString,
        endDate: endDateString,
        dataElementCodes: dataElementCodesForFetch,
      },
      { aggregations },
    )) as RawEvent[];
    return response.map(event => {
      const { dataValues, ...restOfEvent } = event;
      return { ...dataValues, ...restOfEvent };
    });
  }

  public getParameters() {
    const parameters = super.getParameters();
    // Not including aggregations, as they are a hidden parameter
    const filteredParameters = parameters.filter(({ name }) => name !== 'aggregations');
    return orderParametersByName(filteredParameters, [
      'hierarchy',
      'organisationUnitCodes',
      'dataGroupCode',
      'dataElementCodes',
      'startDate',
      'endDate',
    ]);
  }
}
