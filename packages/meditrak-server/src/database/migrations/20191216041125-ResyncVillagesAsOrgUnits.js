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

const getIdsString = ({ rows: records }) => records.map(({ id }) => `'${id}'`).join(',');

exports.up = async function(db) {
  const allIdsToResync = [];
  // resync all village entities, so they are created as org units
  const villageEntities = await db.runSql(`SELECT id FROM entity WHERE type = 'village'`);
  if (villageEntities.rows.length === 0) {
    return; // this happens on the codeship machine during testing, where this migration isn't required
  }
  allIdsToResync.push(...villageEntities.rows);
  const villageIds = getIdsString(villageEntities);

  // resync all cases with villages as their parent, so they are recorded on dhis2 with the correct
  // parent org unit (currently the facility above the village)
  const villageChildrenEntities = await db.runSql(
    `SELECT id FROM entity WHERE parent_id IN (${villageIds})`,
  );
  allIdsToResync.push(...villageChildrenEntities.rows);
  const villageChildrenIds = getIdsString(villageChildrenEntities);

  // resync all survey responses attached to village entities directly, or where the village is the
  // parent of the directly attached entity
  const surveyResponses = await db.runSql(`
    SELECT
      id
    FROM
      survey_response
    WHERE
      entity_id IN (${villageIds},${villageChildrenIds});
  `);
  allIdsToResync.push(...surveyResponses.rows);

  // delete the tracked entity instance id from villages
  await db.runSql(`
    UPDATE
      entity
    SET
      metadata = metadata #- '{dhis,id}'
    WHERE
      id IN (${villageIds});
  `);

  // resync all relevant records, in batches so we don't cause collisions on change_time
  const RESYNC_BATCH_SIZE = 50;
  for (let i = 0; i < allIdsToResync.length; i += RESYNC_BATCH_SIZE) {
    const recordIds = getIdsString({ rows: allIdsToResync.slice(i, i + RESYNC_BATCH_SIZE) });
    await db.runSql(`
      -- resync relevant records
      UPDATE
        dhis_sync_queue
      SET
        priority = 1, is_deleted = FALSE
      WHERE
        record_id IN (${recordIds});
    `);
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
