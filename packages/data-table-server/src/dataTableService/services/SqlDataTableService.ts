import { yup } from '@tupaia/utils';
import { DataTableServerModelRegistry } from '../../types';
import { DataTableService } from '../DataTableService';
import { removeSemicolon } from '../utils';

const configSchema = yup.object().shape({
  externalDatabaseConnectionCode: yup.string().required(),
  sql: yup.string().required(),
});

type SqlDataTableContext = {
  models: DataTableServerModelRegistry;
};

export class SqlDataTableService extends DataTableService<
  SqlDataTableContext,
  yup.AnyObjectSchema,
  typeof configSchema,
  Record<string, unknown>
> {
  protected supportsAdditionalParams = true;

  public constructor(context: SqlDataTableContext, config: unknown) {
    super(context, yup.object(), configSchema, config);
  }

  private async getDatabaseConnection(externalDatabaseConnectionCode: string) {
    const databaseConnection = await this.ctx.models.externalDatabaseConnection.findOne({
      code: externalDatabaseConnectionCode,
    });

    if (!databaseConnection) {
      throw new Error(
        `Cannot find external database connection with code: ${externalDatabaseConnectionCode}`,
      );
    }

    return databaseConnection;
  }

  private formatRequestParameters(params: Record<string, unknown>) {
    const allSupportedParameters = this.getParameters();
    const formattedParameters: Record<string, unknown> = { ...params };
    allSupportedParameters.forEach(({ name }) => {
      // Add missing parameters as NULL
      if (params[name] === undefined) {
        formattedParameters[name] = null;
      }
    });
    return formattedParameters;
  }

  protected async pullData(params: Record<string, unknown>) {
    const { externalDatabaseConnectionCode, sql } = this.config;
    const databaseConnection = await this.getDatabaseConnection(externalDatabaseConnectionCode);
    const formattedParams = this.formatRequestParameters(params);
    return databaseConnection.executeSql(sql, formattedParams) as Promise<
      Record<string, unknown>[]
    >;
  }

  protected async pullPreviewData(params: Record<string, unknown>) {
    const { externalDatabaseConnectionCode, sql: rawSql } = this.config;
    const formattedParams = this.formatRequestParameters(params);
    const sql = removeSemicolon(rawSql);
    const databaseConnection = await this.getDatabaseConnection(externalDatabaseConnectionCode);
    const LIMIT = 200;
    const wrappedResultQuery = `SELECT * FROM (${sql}) as preview_data LIMIT ${LIMIT}`;
    const wrappedCountQuery = `SELECT count(*) FROM (${sql}) as preview_data`;

    const results = await databaseConnection.executeSql(wrappedResultQuery, formattedParams);
    const total = await databaseConnection.executeSql(wrappedCountQuery, formattedParams);

    return { rows: results, total: +total[0].count, limit: LIMIT };
  }
}
