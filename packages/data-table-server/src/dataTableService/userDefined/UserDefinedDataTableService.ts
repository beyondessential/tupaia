/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';
import { DataTableParameter } from '../types';
import { dataTableParamsToYupSchema } from '../utils';

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

const userDefinedDataTableConfigValidator = yup
  .object()
  .shape({ parameters: dataTableParamsValidator });

export abstract class UserDefinedDataTableService<
  Context extends Record<string, unknown> = Record<string, unknown>,
  ConfigSchema extends yup.AnyObjectSchema = yup.AnyObjectSchema,
  RecordSchema = unknown
> extends DataTableService<Context, yup.AnyObjectSchema, ConfigSchema, RecordSchema> {
  private readonly parameters: DataTableParameter[];

  protected constructor(context: Context, configSchema: ConfigSchema, config: unknown) {
    const { parameters = [], ...restOfConfig } = userDefinedDataTableConfigValidator.validateSync(
      config,
    );
    const paramsSchema = dataTableParamsToYupSchema(parameters);
    super(context, paramsSchema, configSchema, restOfConfig);
    this.parameters = parameters;
  }

  public getParameters() {
    return this.parameters;
  }
}
