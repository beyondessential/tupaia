import { AccessPolicy } from '@tupaia/access-policy';
import { Aggregator } from '@tupaia/aggregator';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataBroker } from '@tupaia/data-broker';
import { yup } from '@tupaia/utils';
import { ISO_DATE_PATTERN } from '@tupaia/tsutils';
import { DataTableService } from '../DataTableService';
import { orderParametersByName } from '../utils';
import {
  getDefaultEndDateString,
  getDefaultStartDateString,
  mapProjectEntitiesToCountries,
} from './utils';

const requiredParamsSchema = yup.object().shape({
  hierarchy: yup.string().default('explore'),
  dataGroupCode: yup.string().required(),
  dataElementCodes: yup.array().of(yup.string().required()).min(1),
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup
    .string()
    .matches(ISO_DATE_PATTERN, {
      message: 'startDate must be a valid ISO 8601 date: YYYY-MM-DD',
    })
    .default(getDefaultStartDateString),
  endDate: yup
    .string()
    .matches(ISO_DATE_PATTERN, {
      message: 'endDate must be a valid ISO 8601 date: YYYY-MM-DD',
    })
    .default(getDefaultEndDateString),
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
    startDate?: string;
    endDate?: string;
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
        startDate,
        endDate,
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
