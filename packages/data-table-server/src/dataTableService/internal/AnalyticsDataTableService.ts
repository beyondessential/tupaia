/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { yup, yupUtils, hasNoContent, takesDateForm } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const paramsSchema = yup.object().shape({
  hierarchy: yup.string().required(),
  dataElementCodes: yup.array().of(yup.string().required()).strict().required(),
  organisationUnitCodes: yup.array().of(yup.string().required()).strict().required(),
  startDate: yup
    .string()
    .test(
      yupUtils.yupTestAny([hasNoContent, takesDateForm], 'startDate should be in ISO 8601 format'),
    ),
  endDate: yup
    .string()
    .test(
      yupUtils.yupTestAny([hasNoContent, takesDateForm], 'endDate should be in ISO 8601 format'),
    ),
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
  typeof paramsSchema,
  typeof configSchema,
  Analytic
> {
  public constructor(context: AnalyticsDataTableServiceContext, config: unknown) {
    super(context, paramsSchema, configSchema, config);
  }

  protected async pullData(params: {
    hierarchy: string;
    dataElementCodes: string[];
    organisationUnitCodes: string[];
    startDate?: string;
    endDate?: string;
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
        startDate,
        endDate,
        detectDataServices: true,
      },
      { aggregations },
    );

    return results as Analytic[];
  }
}

export const createAnalyticsDataTableService = (
  context: AnalyticsDataTableServiceContext,
  config: unknown,
) => new AnalyticsDataTableService(context, config);
