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
  dataGroupCode: yup.string().required(),
});

const configSchema = yup.object();

type DataGroupMetaDataDataTableServiceContext = {
  apiClient: TupaiaApiClient;
  accessPolicy: AccessPolicy;
};
type DataGroup = {
  code: string;
  name: string;
  dataElements: { code: string; name: string; text: string; options: Record<string, unknown>[] }[];
};

/**
 * DataTableService for pulling data from data-broker's fetchDataGroup() endpoint
 */
export class DataGroupMetaDataDataTableService extends DataTableService<
  DataGroupMetaDataDataTableServiceContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  DataGroup
> {
  protected supportsAdditionalParams = false;

  public constructor(context: DataGroupMetaDataDataTableServiceContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: { dataGroupCode: string }) {
    const { dataGroupCode } = params;

    const aggregator = new Aggregator(
      new DataBroker({
        services: this.ctx.apiClient,
        accessPolicy: this.ctx.accessPolicy,
      }),
    );

    const result = await aggregator.fetchDataGroup(dataGroupCode, {});

    return [result] as DataGroup[];
  }
}
