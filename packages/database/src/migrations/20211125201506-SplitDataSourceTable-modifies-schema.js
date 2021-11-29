'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const updateForeignKey = async (
  db,
  tableName,
  oldFKTable,
  oldFKColumn,
  newFKTable,
  newFKColumn,
) => {
  await db.runSql(`
    ALTER TABLE ${tableName}
    ADD COLUMN ${newFKColumn} TEXT;

    UPDATE ${tableName}
    SET ${newFKColumn} = ${newFKTable}.id
    FROM ${newFKTable}
    INNER JOIN ${oldFKTable}
      ON ${newFKTable}.code = ${oldFKTable}.code
    WHERE ${oldFKTable}.id = ${oldFKColumn};

    ALTER TABLE ${tableName}
    ADD FOREIGN KEY (${newFKColumn})
    REFERENCES ${newFKTable}(id);

    ALTER TABLE ${tableName}
    ALTER COLUMN ${newFKColumn} SET NOT NULL;

    ALTER TABLE ${tableName}
    DROP COLUMN ${oldFKColumn};
  `);
};

exports.up = async function (db) {
  // Create new table for data groups (renamed to events)
  await db.runSql(`
    CREATE TABLE event (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      service_type service_type NOT NULL,
      config JSONB NOT NULL DEFAULT '{}'
    );
  `);
  // Copy data groups info into new table
  await db.runSql(`
    INSERT INTO event (id, code, service_type, config)
    SELECT generate_object_id(), code, service_type, config
    FROM data_source
    WHERE type = 'dataGroup';
  `);
  // Update foreign keys that refer to data groups
  await updateForeignKey(
    db,
    'data_element_data_group',
    'data_source',
    'data_group_id',
    'event',
    'event_id',
  );
  await updateForeignKey(db, 'survey', 'data_source', 'data_source_id', 'event', 'event_id');

  // Drop data groups from data source table
  // Drop type column since it's no longer relevant
  await db.runSql(`
    DELETE FROM data_source
    WHERE type = 'dataGroup';

    ALTER TABLE data_source
    DROP COLUMN type;
  `);
};

exports.down = async function (db) {
  // Add type column back into data_source table
  await db.runSql(`
    ALTER TABLE data_source
    ADD COLUMN type data_source_type;

    UPDATE data_source
    SET type = 'dataElement';

    ALTER TABLE data_source
    ALTER COLUMN type SET NOT NULL;
  `);
  // Move data groups info back into data_source table
  await db.runSql(`
    INSERT INTO data_source (id, code, service_type, config, type)
    SELECT generate_object_id(), code, service_type, config, 'dataGroup'
    FROM event;
  `);
  // Update foreign keys back to data_source table
  await updateForeignKey(
    db,
    'data_element_data_group',
    'event',
    'event_id',
    'data_source',
    'data_group_id',
  );
  await updateForeignKey(db, 'survey', 'event', 'event_id', 'data_source', 'data_source_id');
  // Drop the event table
  await db.runSql(`
    DROP TABLE event;
  `);
};

exports._meta = {
  version: 1,
};
