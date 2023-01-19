/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { DataTableParameter } from './types';
import { dataTableParamsToYupSchema, yupSchemaToDataTableParams } from './utils';

export type ServiceContext<Type> = Type extends DataTableService<infer Context> ? Context : never;

export type ClassOfDataTableService<Service extends DataTableService> = new (
  context: ServiceContext<Service>,
  config: unknown,
) => Service;

const dataTableParamsValidator = yup.array().of(
  yup.object().shape({
    name: yup.string().required(),
    config: yup.object().shape({
      type: yup.string().required(),
      oneOf: yup.array(),
      required: yup.boolean(),
    }),
  }),
);

const additionalParamsConfigValidator = yup
  .object()
  .shape({ additionalParams: dataTableParamsValidator });

/**
 * A DataTableService is used to fetch data for a given type of data-table
 * (eg. SQL type data-tables use the SqlDataTableService)
 *
 * Concrete implementations of this class will specify the following generic arguments
 * - context: the context dependencies that need to be available for the data-table service (eg. models, apiClient, etc.)
 * - config schema: the config options required by the data-table service
 * - required params schema: the parameters required by the data-table service at fetch time
 * - record schema: the shape of the rows returned when fetching data
 */
export abstract class DataTableService<
  Context extends Record<string, unknown> = Record<string, unknown>,
  RequiredParamsSchema extends yup.AnyObjectSchema = yup.AnyObjectSchema,
  ConfigSchema extends yup.AnyObjectSchema = yup.AnyObjectSchema,
  RecordSchema = unknown
> {
  protected readonly ctx: Context;
  protected readonly requiredParamsSchema: RequiredParamsSchema;
  protected readonly configSchema: ConfigSchema;
  protected readonly config: yup.InferType<ConfigSchema>;

  protected abstract readonly supportsAdditionalParams: boolean; // Whether additional parameters can be defined a for a data-table of this service type at create time

  protected constructor(
    context: Context,
    requiredParamsSchema: RequiredParamsSchema,
    configSchema: ConfigSchema,
    config: unknown,
  ) {
    this.ctx = context;
    this.requiredParamsSchema = requiredParamsSchema;
    this.configSchema = configSchema;
    this.config = this.configSchema.validateSync(config);
  }

  protected validateParams(params: unknown) {
    if (!this.supportsAdditionalParams) {
      return this.requiredParamsSchema.validateSync(params);
    }

    const { additionalParams = [] } = additionalParamsConfigValidator.validateSync(this.config);
    const additionalParamsValidator = dataTableParamsToYupSchema(additionalParams);

    return this.requiredParamsSchema.concat(additionalParamsValidator).validateSync(params);
  }

  /**
   * Implement specific functionality for pulling data in the concrete implementation
   */
  protected abstract pullData(params: yup.InferType<RequiredParamsSchema>): Promise<RecordSchema[]>;

  public fetchData(params: unknown = {}) {
    const validatedParams = this.validateParams(params);
    return this.pullData(validatedParams);
  }

  public getParameters(): DataTableParameter[] {
    const requiredParams = yupSchemaToDataTableParams(this.requiredParamsSchema);

    if (!this.supportsAdditionalParams) {
      return requiredParams;
    }

    const { additionalParams = [] } = additionalParamsConfigValidator.validateSync(this.config);
    dataTableParamsToYupSchema(additionalParams); // Do this to ensure that the params can be serialized to a yup schema

    return [...requiredParams, ...additionalParams];
  }
}
