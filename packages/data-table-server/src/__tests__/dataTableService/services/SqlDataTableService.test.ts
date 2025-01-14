import { DataTableServerModelRegistry } from '../../../types';
import { DataTableServiceBuilder } from '../../../dataTableService';

const externalDatabaseConnection = {
  code: 'ext_db_conn',
  executeSql: async (sql: string, params: Record<string, unknown>) => [{ sql, params }],
};

const modelsStub = ({
  externalDatabaseConnection: {
    findOne: ({ code }: { code: string }) =>
      code === externalDatabaseConnection.code ? externalDatabaseConnection : undefined,
  },
} as unknown) as DataTableServerModelRegistry;

describe('SqlDataTableService', () => {
  describe('config validation', () => {
    const testData: [string, unknown, string][] = [
      [
        'missing externalDatabaseConnectionCode',
        { sql: 'SELECT * FROM table' },
        'externalDatabaseConnectionCode is a required field',
      ],
      [
        'missing sql',
        { externalDatabaseConnectionCode: externalDatabaseConnection.code },
        'sql is a required field',
      ],
    ];

    it.each(testData)('%s', (_, config: unknown, expectedError: string) => {
      expect(() =>
        new DataTableServiceBuilder()
          .setServiceType('sql')
          .setContext({ models: modelsStub })
          .setConfig(config)
          .build(),
      ).toThrow(expectedError);
    });
  });

  describe('fetchData', () => {
    it('throws error if cannot find an external database connection with the config code', async () => {
      const service = new DataTableServiceBuilder()
        .setServiceType('sql')
        .setContext({ models: modelsStub })
        .setConfig({
          sql: 'SELECT * FROM table',
          externalDatabaseConnectionCode: 'not_a_real_code',
        })
        .build();

      await expect(service.fetchData()).rejects.toThrow(
        'Cannot find external database connection with code: not_a_real_code',
      );
    });

    it('returns the result of executeSql(sql, params) from the external database connection', async () => {
      const sql = 'SELECT * FROM analytics WHERE entity_code = :entityCode';
      const params = { entityCode: 'TO' };
      const service = new DataTableServiceBuilder()
        .setServiceType('sql')
        .setContext({ models: modelsStub })
        .setConfig({
          sql,
          externalDatabaseConnectionCode: externalDatabaseConnection.code,
          additionalParams: [{ name: 'entityCode', config: { type: 'string' } }],
        })
        .build();

      const [result] = await service.fetchData(params);
      expect(result).toEqual({ sql, params });
    });

    it('converts params with missing values to nulls', async () => {
      const sql =
        'SELECT * FROM analytics WHERE entity_code = :entityCode AND hierarchy = :hierarchy';
      const params = { entityCode: 'TO' };
      const service = new DataTableServiceBuilder()
        .setServiceType('sql')
        .setContext({ models: modelsStub })
        .setConfig({
          sql,
          externalDatabaseConnectionCode: externalDatabaseConnection.code,
          additionalParams: [
            { name: 'entityCode', config: { type: 'string' } },
            { name: 'hierarchy', config: { type: 'string' } },
          ],
        })
        .build();

      const [result] = await service.fetchData(params);
      expect(result).toEqual({ sql, params: { ...params, hierarchy: null } });
    });
  });
});
