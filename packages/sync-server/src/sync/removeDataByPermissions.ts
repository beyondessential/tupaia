import {
  DatabaseModel,
  TupaiaDatabase,
  mergeMultiJoin,
  SCHEMA_NAMES,
  QUERY_METHODS,
} from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';

export const removeDataByPermissions = async (
  sessionId: string,
  database: TupaiaDatabase,
  models: DatabaseModel[],
  accessPolicy: AccessPolicy,
) => {
  for (const model of models) {
    const hasCustomLookupQuery =
      'createPermissionsFilter' in model && typeof model.createPermissionsFilter === 'function';

    if (!hasCustomLookupQuery) {
      continue;
    }

    const { dbConditions: permissionsDbConditions, dbOptions: permissionsDbOptions } = await (
      model.createPermissionsFilter as Function
    )(accessPolicy);

    const tableName = model.databaseRecord;

    const dbConditions = {
      notExists: {
        queryMethod: QUERY_METHODS.SELECT,
        recordType: tableName,
        where: permissionsDbConditions,
        options: {
          ...permissionsDbOptions,
          innerQuery: tableName,
          columns: [`${tableName}.id`],
          multiJoin: mergeMultiJoin(
            [
              {
                joinWith: `${SCHEMA_NAMES.SYNC_SNAPSHOT}.${sessionId}`,
                joinCondition: [
                  `${SCHEMA_NAMES.SYNC_SNAPSHOT}.${sessionId}.record_id`,
                  `${tableName}.id`,
                ],
              },
            ],
            permissionsDbOptions.multiJoin,
          ),
        },
      },
    };

    await database.delete(sessionId, dbConditions, SCHEMA_NAMES.SYNC_SNAPSHOT);
  }
};
