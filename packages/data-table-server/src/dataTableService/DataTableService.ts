/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { DataTableParameter } from './types';

export type ServiceContext<Type> = Type extends DataTableService<infer Context> ? Context : never;

export type ClassOfDataTableService<Service extends DataTableService> = new (
  context: ServiceContext<Service>,
  config: unknown,
) => Service;

/**
 * A DataTableService is used to fetch data for a given type of data-table
 * (eg. SQL type data-tables use the SqlDataTableService)
 *
 * Concrete implementations of this class will specify the following generic arguments
 * - context: the context dependencies that need to be available for the data-table type (eg. models, apiClient, etc.)
 * - config schema: the config options required by the data-table type
 * - params schema: the parameters required by the data-table type when fetching data
 * - record schema: the shape of the rows returned when fetching data
 */
export abstract class DataTableService<
  Context extends Record<string, unknown> = Record<string, unknown>,
  ParamsSchema extends yup.AnyObjectSchema = yup.AnyObjectSchema,
  ConfigSchema extends yup.AnyObjectSchema = yup.AnyObjectSchema,
  RecordSchema = unknown
> {
  protected readonly ctx: Context;
  protected readonly paramsSchema: ParamsSchema;
  protected readonly configSchema: ConfigSchema;
  protected readonly config: yup.InferType<ConfigSchema>;

  protected constructor(
    context: Context,
    paramsSchema: ParamsSchema,
    configSchema: ConfigSchema,
    config: unknown,
  ) {
    this.ctx = context;
    this.paramsSchema = paramsSchema;
    this.configSchema = configSchema;
    this.config = this.configSchema.validateSync(config);
  }

  protected validateParams(params: unknown) {
    return this.paramsSchema.validateSync(params);
  }

  /**
   * Implement specific functionality for pulling data in the concrete implementation
   */
  protected abstract pullData(params: yup.InferType<ParamsSchema>): Promise<RecordSchema[]>;

  public fetchData(params: unknown = {}) {
    const validatedParams = this.validateParams(params);
    return this.pullData(validatedParams);
  }

  public abstract getParameters(): DataTableParameter[];
}
