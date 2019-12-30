'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// All the unique constraints we need to add, keyed by table name
// Details about current duplicates at time of writing in comments next to each
const UNIQUE_CONSTRAINTS = {
  user_reward: ['type', 'record_id'], // 72 duplicate pairs due to race condition, fine to keep latest
  dhis_sync_queue: ['record_id'], // 217 duplicate pairs due to race condition, fine to keep latest
  dhis_sync_log: ['record_id'], // 363 duplicate pairs due to race condition, fine to keep latest
  ms1_sync_queue: ['record_id'], // 0 duplicates - table not yet in use
  ms1_sync_log: ['record_id'], // 0 duplicates - table not yet in use
  refresh_token: ['user_id', 'device'], // 0 duplicates
  option: ['option_set_id', 'value'], // 0 duplicates
  answer: ['survey_response_id', 'question_id'], // 5601 duplicate pairs due to https://github.com/beyondessential/meditrak/issues/428
  meditrak_sync_queue: ['record_id'], // 1436 duplicate pairs due to race condition, fine to keep latest
};

// Removes duplicates matching on `uniqueColumns`, except for the most recently created
const removeDuplicates = (db, tableName, uniqueColumns) =>
  db.runSql(`
    DELETE FROM ${tableName}
    WHERE id IN (
      SELECT id FROM ${tableName}
      RIGHT JOIN (
        SELECT max(id) as max_id, ${uniqueColumns.join(',')}
            FROM ${tableName}
        GROUP BY ${uniqueColumns.join(',')}
        HAVING count(*) > 1
      ) AS ${tableName}_duplicates
        ON ${uniqueColumns
          .map(columnName => `${tableName}.${columnName} = ${tableName}_duplicates.${columnName}`)
          .join(' AND ')}
      WHERE id <> max_id
    );
`);

const addUniqueConstraint = (db, tableName, uniqueColumns) =>
  db.runSql(`
    ALTER TABLE "${tableName}"
      ADD CONSTRAINT ${tableName}_${uniqueColumns.join('_')}_unique
        UNIQUE (${uniqueColumns.join(',')});
  `);

exports.up = async db => {
  const constraintEntries = Object.entries(UNIQUE_CONSTRAINTS);
  for (let i = 0; i < constraintEntries.length; i++) {
    const [tableName, uniqueColumns] = constraintEntries[i];
    await removeDuplicates(db, tableName, uniqueColumns);
    await addUniqueConstraint(db, tableName, uniqueColumns);
  }
};

const dropUniqueConstraint = (db, tableName, uniqueColumns) =>
  db.runSql(`
    ALTER TABLE "${tableName}"
      DROP CONSTRAINT ${tableName}_${uniqueColumns.join('_')}_unique;
  `);

exports.down = db =>
  Promise.all(
    Object.entries(UNIQUE_CONSTRAINTS).map(async ([tableName, uniqueColumns]) =>
      dropUniqueConstraint(db, tableName, uniqueColumns),
    ),
  );

exports._meta = {
  version: 1,
};
