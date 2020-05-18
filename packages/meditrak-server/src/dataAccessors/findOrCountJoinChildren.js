import { QUERY_METHODS } from '@tupaia/database';

export async function findOrCountJoinChildren(
  models,
  findOrCount,
  recordType,
  parentRecordType,
  parentRecordId,
  criteria,
  options,
) {
  const db = models.database;
  const joinTable = `${parentRecordType}_${recordType}`;
  const params = [
    recordType,
    { ...criteria, [`${joinTable}.${parentRecordType}_id`]: parentRecordId },
    { ...options, columns: null, joinWith: joinTable },
  ];

  if (findOrCount === 'find') {
    params[2].columns = [`${recordType}.*`, `${joinTable}.id as ${joinTable}_id`];
    return db.find(...params);
  }

  if (findOrCount === QUERY_METHODS.COUNT) {
    const result = await db.find(...params, QUERY_METHODS.COUNT);
    return parseInt(result[0].count, 10);
  }

  return null;
}
