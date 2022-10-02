/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { DataTableServerModelRegistry } from '../../types';
import { UserDefinedDataTableService } from './UserDefinedDataTableService';

const configSchema = yup.object().shape({
  externalDatabaseConnectionCode: yup.string().required(),
  sql: yup.string().required(),
});

type SqlDataTableContext = {
  models: DataTableServerModelRegistry;
};

export class SqlDataTableService extends UserDefinedDataTableService<
  SqlDataTableContext,
  typeof configSchema,
  Record<string, unknown>
> {
  public constructor(context: SqlDataTableContext, config: unknown) {
    super(context, configSchema, config);
  }

  protected async pullData(params: Record<string, unknown>) {
    const { externalDatabaseConnectionCode, sql } = this.config;
    const databaseConnection = await this.ctx.models.externalDatabaseConnection.findOne({
      code: externalDatabaseConnectionCode,
    });

    if (!databaseConnection) {
      throw new Error(
        `Cannot find external database connection with code: ${externalDatabaseConnectionCode}`,
      );
    }

    return databaseConnection.executeSql(sql, params) as Promise<Record<string, unknown>[]>;
  }
}
