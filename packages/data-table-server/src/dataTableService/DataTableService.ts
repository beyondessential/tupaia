/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

export abstract class DataTableService<
  Context extends Record<string, unknown> = Record<string, unknown>,
  ParamsSchema extends yup.AnySchema = yup.AnySchema,
  ConfigSchema extends yup.AnySchema = yup.AnySchema,
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
}
