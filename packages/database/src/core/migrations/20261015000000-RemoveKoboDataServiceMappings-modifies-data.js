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

/**
 * Abort rather than delete if any kobo-backed data sources remain. Deleting them would cascade to
 * `data_element_data_group` and null out `survey.data_group_id`, which `down` cannot reconstruct.
 */
const assertNoKoboDataSources = async db => {
  const { rows } = await db.runSql(`
    SELECT
      (SELECT count(*) FROM data_element WHERE service_type = 'kobo') AS data_element,
      (
        SELECT count(*) FROM data_element_data_service
        WHERE service_type = 'kobo'
          OR data_element_code IN (SELECT code FROM data_element WHERE service_type = 'kobo')
      ) AS data_element_data_service,
      (SELECT count(*) FROM data_group WHERE service_type = 'kobo') AS data_group;
  `);
  const nonEmpty = Object.entries(rows[0]).filter(([, count]) => Number(count) > 0);
  if (nonEmpty.length > 0) {
    const counts = nonEmpty.map(([table, count]) => `${table}: ${count}`).join(', ');
    throw new Error(`Found kobo data sources that must be removed manually first (${counts})`);
  }
};

exports.up = async function (db) {
  /** As of comitting, these are expected to be no-ops */
  await assertNoKoboDataSources(db);
  await db.runSql(`
    DELETE FROM data_element_data_service
    WHERE service_type = 'kobo'
      OR data_element_code IN (SELECT code FROM data_element WHERE service_type = 'kobo');
  `);
  await db.runSql("DELETE FROM data_element WHERE service_type = 'kobo';");
  await db.runSql("DELETE FROM data_group WHERE service_type = 'kobo';");

  /** Drop mappings that only held a `kobo_id`, and strip it from any others */
  await db.runSql(`
    DELETE FROM data_service_entity
    WHERE config -> 'kobo_id' IS NOT NULL AND config - 'kobo_id' = '{}'::jsonb;
  `);
  await db.runSql(`
    UPDATE data_service_entity
    SET config = config - 'kobo_id'
    WHERE config -> 'kobo_id' IS NOT NULL;
  `);
};

/** Irreversible: deleted mappings are not reconstructed. */
exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
