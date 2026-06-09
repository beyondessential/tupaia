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

const mapOverlayGroup = 'Malaria Stock Availability by Facility';

exports.up = async function (db) {
  const { rows: mapOverlays } = await db.runSql(
    `
    select * from "mapOverlay" mo 
    where mo.id in (
      select mogr.child_id from map_overlay_group_relation mogr 
      where map_overlay_group_id in (
        select mog.id from map_overlay_group mog 
        where name = '${mapOverlayGroup}'
      )
    )
    `,
  );
  for (const mapOverlay of mapOverlays) {
    const { id } = mapOverlay;
    await db.runSql(
      `
      update "mapOverlay" dr
      set "measureBuilderConfig" = regexp_replace(dr."measureBuilderConfig"::text, '\\"facility\\"','["facility", "sub_facility"]','g')::jsonb
      where id = '${id}';

      update "mapOverlay" dr
      set "presentationOptions" = regexp_replace(dr."presentationOptions"::text, '\\"Facility\\"','["Facility", "SubFacility"]','g')::jsonb
      where id = '${id}';
    `,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
