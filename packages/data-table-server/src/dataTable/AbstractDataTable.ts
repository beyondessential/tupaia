/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { yup } from '@tupaia/utils';

export abstract class AbstractDataTable<
  ParamsSchema extends yup.AnySchema = yup.AnySchema,
  ConfigSchema extends yup.AnySchema = yup.AnySchema,
  RecordSchema = unknown
> {
  protected readonly paramsSchema: ParamsSchema;
  protected readonly configSchema: ConfigSchema;
  protected readonly apiClient: TupaiaApiClient;
  protected readonly config: yup.InferType<ConfigSchema>;

  protected constructor(
    paramsSchema: ParamsSchema,
    configSchema: ConfigSchema,
    apiClient: TupaiaApiClient,
    config: unknown,
  ) {
    this.paramsSchema = paramsSchema;
    this.configSchema = configSchema;
    this.apiClient = apiClient;
    this.config = this.configSchema.validateSync(config);
  }

  protected validateParams(params: unknown) {
    return this.paramsSchema.validateSync(params);
  }

  protected abstract safelyFetchData(params: yup.InferType<ParamsSchema>): Promise<RecordSchema[]>;

  public fetchData(params: unknown) {
    const validatedParams = this.validateParams(params);
    return this.safelyFetchData(validatedParams);
  }
}
