/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/*
 * GENERIC DATA ACCESSOR
 * recordType, parentRecordType, parentRecordId are sent
 * a record in table recordType is created
 * a record in join table parentRecordType_recordType is created
 * the recordType and parentRecordType ids are used in the join table
 */
export async function createJoinChild(
  models,
  recordType,
  recordData,
  parentRecordType,
  parentRecordId,
) {
  const db = models.database;
  const joinTable = `${parentRecordType}_${recordType}`;

  const childRecord = await db.create(recordType, recordData);
  await db.create(joinTable, {
    [`${parentRecordType}_id`]: parentRecordId,
    [`${recordType}_id`]: childRecord.id,
  });

  return childRecord;
}
