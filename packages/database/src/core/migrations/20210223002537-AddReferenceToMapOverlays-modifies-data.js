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

const mapOverlayGroupName = 'Weather Observations/Forecast';
const newConfig = {
  info: { reference: { name: 'openweather', link: 'https://openweathermap.org/' } },
};
const modifyMapOverlays = async (db, command) => {
  await db.runSql(`
      update "mapOverlay" 
      set "presentationOptions" = "presentationOptions"::jsonb ${command}
      where id in (
          select mogr.child_id from map_overlay_group_relation mogr 
          join map_overlay_group mog on mog.id = mogr.map_overlay_group_id 
          where mog.name = '${mapOverlayGroupName}'
      )
  `);
};
const addElement = `|| '${JSON.stringify(newConfig)}'::jsonb`;
const deleteElement = `#- '{info}'`;

exports.up = async function (db) {
  await modifyMapOverlays(db, addElement);
};

exports.down = async function (db) {
  await modifyMapOverlays(db, deleteElement);
};

exports._meta = {
  version: 1,
};
