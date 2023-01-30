/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { EARLIEST_DATA_DATE_STRING, yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';
import { orderParametersByName } from '../utils';

const requiredParamsSchema = yup.object().shape({
  hierarchy: yup.string().default('explore'),
  dataElementCodes: yup.array().of(yup.string().required()).required(),
  organisationUnitCodes: yup.array().of(yup.string().required()).required(),
  startDate: yup.date().default(new Date(EARLIEST_DATA_DATE_STRING)),
  endDate: yup.date().default(() => new Date()),
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
    startDate: Date;
    endDate: Date;
    aggregations?: { type: string; config?: Record<string, unknown> }[];
  }) {
    const {
      hierarchy,
      dataElementCodes,
      organisationUnitCodes,
      startDate,
      endDate,
      aggregations,
    } = params;

    const startDateString = startDate.toISOString();
    const endDateString = endDate.toISOString();

    const aggregator = new Aggregator(
      new DataBroker({
        services: this.ctx.apiClient,
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const { results } = await aggregator.fetchAnalytics(
      dataElementCodes,
      {
        organisationUnitCodes,
        hierarchy,
        startDate: startDateString,
        endDate: endDateString,
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
