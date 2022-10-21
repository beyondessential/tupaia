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
   * Implement in concrete class
   */
  protected abstract pullData(params: yup.InferType<ParamsSchema>): Promise<RecordSchema[]>;

  public fetchData(params: unknown) {
    const validatedParams = this.validateParams(params);
    return this.pullData(validatedParams);
  }

  public abstract getParameters(): DataTableParameter[];
}
