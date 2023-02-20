/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const requiredParamsSchema = yup.object().shape({
  dataElementCodes: yup.array().of(yup.string().required()).required(),
});

const configSchema = yup.object();

type DataElementMetadataDataTableServiceContext = {
  apiClient: TupaiaApiClient;
  accessPolicy: AccessPolicy;
};
type DataElements = { code: string; name: string };

/**
 * DataTableService for pulling data from data-broker's fetchDataElements() endpoint
 */
export class DataElementMetadataDataTableService extends DataTableService<
  DataElementMetadataDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  DataElements
> {
  protected supportsAdditionalParams = false;

  public constructor(context: DataElementMetadataDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: { dataElementCodes: string[] }) {
    const { dataElementCodes } = params;

    const aggregator = new Aggregator(
      new DataBroker({
        services: this.ctx.apiClient,
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const results = await aggregator.fetchDataElements(dataElementCodes, {
      includeOptions: true,
    });

    return results as DataElements[];
  }
}
