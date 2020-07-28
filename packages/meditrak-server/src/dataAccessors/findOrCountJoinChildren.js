/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
  const columns = [`${recordType}.*`];
  const params = {
    recordType,
    criteria: { ...criteria, [`${joinTable}.${parentRecordType}_id`]: parentRecordId },
    options: { ...options, columns: findOrCount === 'find' ? columns : null, joinWith: joinTable },
  };

  return db[findOrCount](...Object.values(params));
}
