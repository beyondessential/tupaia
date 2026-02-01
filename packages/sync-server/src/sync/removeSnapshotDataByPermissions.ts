import log from 'winston';

import {
  DatabaseModel,
  TupaiaDatabase,
  SCHEMA_NAMES,
  QUERY_METHODS,
  WHERE_SUBQUERY_CLAUSES,
  QUERY_CONJUNCTIONS,
} from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';

/**
 * Deletes data that user does not have access to from the snapshot table.
 */
export const removeSnapshotDataByPermissions = async (
  sessionId: string,
  database: TupaiaDatabase,
  models: DatabaseModel[],
  accessPolicy: AccessPolicy,
) => {
  for (const model of models) {
    const hasCreateRecordsPermissionFilter =
      'createRecordsPermissionFilter' in model &&
      typeof model.createRecordsPermissionFilter === 'function';

    if (!hasCreateRecordsPermissionFilter) {
      continue;
    }

    const { dbConditions: permissionsDbConditions, dbOptions: permissionsDbOptions } = await (
      model.createRecordsPermissionFilter as Function
    )(accessPolicy);

    const tableName = model.databaseRecord;
    const SNAPSHOT_ALIAS = 'snapshot';

    const dbConditions = {
      record_type: tableName,
      [WHERE_SUBQUERY_CLAUSES.NOT_EXISTS]: {
        queryMethod: QUERY_METHODS.SELECT,
        recordType: tableName,
        where: {
          ...permissionsDbConditions,
          [QUERY_CONJUNCTIONS.AND]: {
            [QUERY_CONJUNCTIONS.RAW]: {
              sql: `${tableName}.id = ${SNAPSHOT_ALIAS}.record_id AND ${SNAPSHOT_ALIAS}.record_type = '${tableName}'`,
            },
          },
        },
        options: {
          ...permissionsDbOptions,
          innerQuery: tableName,
          columns: [`${tableName}.id`],
        },
      },
      is_deleted: false, // only delete undeleted records
    };

    // Example query to delete survey responses that user does not have access to from the snapshot table:
    // DELETE FROM "sync_snapshots"."68bd92fe7f36f648a41b6346" AS "snapshot"
    // WHERE NOT EXISTS (
    //    ... select survey responses that user has access to (logic to be defined in the model)
    //    AND survey_response.id = snapshot.record_id
    // )
    await database.delete(
      `${sessionId} AS ${SNAPSHOT_ALIAS}`,
      dbConditions,
      SCHEMA_NAMES.SYNC_SNAPSHOT,
    );

    log.info(`removeSnapshotDataByPermissions(): Filtered ${tableName} by permissions`);
  }
};
