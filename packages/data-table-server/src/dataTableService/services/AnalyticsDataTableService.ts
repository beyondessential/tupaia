import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Aggregator } from '@tupaia/aggregator';
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
  dataElementCodes: yup.array().of(yup.string().required()).required(),
  organisationUnitCodes: yup.array().of(yup.string().required()).required(),
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

type AnalyticsDataTableServiceContext = { apiClient: TupaiaApiClient; accessPolicy: AccessPolicy };
type Analytic = { period: string; organisationUnit: string; dataElement: string; value: unknown };

/**
 * DataTableService for pulling data from data-broker's fetchAnalytics() endpoint
 */
export class AnalyticsDataTableService extends DataTableService<
  AnalyticsDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  Analytic
> {
  protected supportsAdditionalParams = false;

  public constructor(context: AnalyticsDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: {
    hierarchy: string;
    dataElementCodes: string[];
    organisationUnitCodes: string[];
    startDate: string;
    endDate: string;
    aggregations?: { type: string; config?: Record<string, unknown> }[];
  }) {
    const { hierarchy, dataElementCodes, organisationUnitCodes, startDate, endDate, aggregations } =
      params;

    // Ensure that if fetching for project, we map it to the underlying countries
    const entityCodesForFetch = await mapProjectEntitiesToCountries(
      this.ctx.apiClient,
      hierarchy,
      organisationUnitCodes,
    );

    const aggregator = new Aggregator(
      new DataBroker({
        services: this.ctx.apiClient,
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const { results } = await aggregator.fetchAnalytics(
      dataElementCodes,
      {
        organisationUnitCodes: entityCodesForFetch,
        hierarchy,
        startDate,
        endDate,
        detectDataServices: true,
      },
      { aggregations },
    );

    return results as Analytic[];
  }

  // TODO: Sort parameters
  public getParameters() {
    const parameters = super.getParameters();
    // Not including aggregations, as they are a hidden parameter
    const filteredParameters = parameters.filter(({ name }) => name !== 'aggregations');
    return orderParametersByName(filteredParameters, [
      'hierarchy',
      'organisationUnitCodes',
      'dataElementCodes',
      'startDate',
      'endDate',
    ]);
  }
}
