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

exports.up = async function (db) {
  await db.runSql(`
    -- We want to drop the entity trigger because we just want to add push: false to Laos entities, no actual data is changed, this shouldn't trigger any change listener (eg: for pushing)
    DROP TRIGGER IF EXISTS entity_trigger
    ON entity;

    -- Add push = false to Laos entities
    UPDATE entity
    SET metadata = jsonb_set(metadata, '{dhis,push}', 'false')
    WHERE country_code = 'LA'
    AND metadata->'dhis' IS NOT NULL;

    -- Also change the metadata in data column if dhis_sync_log to reflect the same push = false
    UPDATE dhis_sync_log
    SET data = jsonb_set(data::jsonb, '{metadata,dhis,push}', 'false')::text
    WHERE record_type = 'entity'
    AND record_id IN (SELECT id FROM entity WHERE country_code = 'LA' AND metadata->'dhis' IS NOT NULL);
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP TRIGGER IF EXISTS entity_trigger
    ON entity;

    UPDATE entity
    SET metadata = metadata #- '{dhis,push}'
    WHERE country_code = 'LA'
    AND metadata->'dhis'->'push' IS NOT NULL;

    UPDATE dhis_sync_log
    SET data = (data::jsonb #- '{metadata,dhis,push}')::text
    WHERE record_type = 'entity'
    AND record_id IN (SELECT id FROM entity WHERE country_code = 'LA' AND metadata->'dhis'->'push' IS NOT NULL);

    -- Recreate triggers
    CREATE TRIGGER entity_trigger
    AFTER INSERT OR UPDATE or DELETE
    ON entity
    FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports._meta = {
  version: 1,
};
