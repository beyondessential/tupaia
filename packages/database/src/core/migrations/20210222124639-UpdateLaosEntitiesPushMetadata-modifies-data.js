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

const NEW_METADATA = {
  dhis: {
    push: false,
    isDataRegional: true,
  },
};

exports.up = async function (db) {
  await db.runSql(`
    -- We want to drop the entity trigger because we just want to add push: false to Laos entities, no actual data is changed, this shouldn't trigger any change listener (eg: for pushing)
    DROP TRIGGER IF EXISTS entity_trigger
    ON entity;

    -- Add push = false to Laos entities
    UPDATE entity
    SET metadata = '${JSON.stringify(NEW_METADATA)}'
    WHERE country_code = 'LA';

    -- Also change the metadata in data column if dhis_sync_log to reflect the same push = false
    UPDATE dhis_sync_log
    SET data = jsonb_set(data::jsonb, '{metadata}', '${JSON.stringify(NEW_METADATA)}')::text
    WHERE record_type = 'entity'
    AND record_id IN (SELECT id FROM entity WHERE country_code = 'LA');

    -- Recreate triggers
    CREATE TRIGGER entity_trigger
    AFTER INSERT OR UPDATE or DELETE
    ON entity
    FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
