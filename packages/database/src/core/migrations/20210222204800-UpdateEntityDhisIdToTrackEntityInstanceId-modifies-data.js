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
    -- We want to drop the entity trigger because we just want to change the id key -> trackedEntityId, no actual data is changed, this shouldn't trigger any change listener (eg: for pushing)
    DROP TRIGGER IF EXISTS entity_trigger
    ON entity;

    -- Change dhis.id to dhis.trackedEntityId in metadata column of entity for clarity
    UPDATE entity e 
    SET metadata = jsonb_set(metadata, '{dhis}', metadata->'dhis' || jsonb_build_object('trackedEntityId', metadata->'dhis'->'id') #- '{id}')
    WHERE metadata->'dhis'->'id' IS NOT NULL;

    --Also change the metadata in data column if dhis_sync_log to reflect the same dhis.trackedEntityId
    UPDATE dhis_sync_log
    SET data = jsonb_set(data::jsonb, '{metadata,dhis}', data::jsonb->'metadata'->'dhis' || jsonb_build_object('trackedEntityId', data::jsonb->'metadata'->'dhis'->'id') #- '{id}')::text
    WHERE record_type = 'entity' 
    AND data::jsonb->'metadata'->'dhis'->'id' IS NOT NULL;

    -- Recreate triggers
    CREATE TRIGGER entity_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON entity
      FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP TRIGGER IF EXISTS entity_trigger
    ON entity;

    UPDATE entity e 
    SET metadata = jsonb_set(metadata, '{dhis}', metadata->'dhis' || jsonb_build_object('id', metadata->'dhis'->'trackedEntityId') #- '{trackedEntityId}')
    WHERE metadata->'dhis'->'trackedEntityId' IS NOT NULL;

    UPDATE dhis_sync_log
    SET data = jsonb_set(data::jsonb, '{metadata,dhis}', data::jsonb->'metadata'->'dhis' || jsonb_build_object('id', data::jsonb->'metadata'->'dhis'->'trackedEntityId') #- '{trackedEntityId}')::text
    WHERE record_type = 'entity' 
    AND data::jsonb->'metadata'->'dhis'->'trackedEntityId' IS NOT NULL;

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
