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

const syncQueues = ['meditrak', 'dhis', 'ms1'];

exports.up = async function (db) {
  for (let i = 0; i < syncQueues.length; i++) {
    const syncQueue = syncQueues[i];
    await db.runSql(
      `DROP TRIGGER IF EXISTS ${syncQueue}_sync_queue_trigger ON ${syncQueue}_sync_queue`,
    );
  }

  await db.runSql(`DROP FUNCTION IF EXISTS update_change_time`);

  return null;
};

exports.down = async function (db) {
  await db.runSql(`
    CREATE OR REPLACE FUNCTION public.update_change_time()
     RETURNS trigger
     LANGUAGE plpgsql
    AS $function$
        BEGIN
          NEW.change_time = floor(extract(epoch from clock_timestamp()) * 1000) + (CAST (nextval('change_time_seq') AS FLOAT)/1000);
          RETURN NEW;
        END;
        $function$
    ;`);

  for (let i = 0; i < syncQueues.length; i++) {
    const syncQueue = syncQueues[i];
    await db.runSql(`
      create trigger ${syncQueue}_sync_queue_trigger before
      insert
          or
      update
          on
          public.${syncQueue}_sync_queue for each row execute function update_change_time()
  `);
  }

  return null;
};

exports._meta = {
  version: 1,
};
