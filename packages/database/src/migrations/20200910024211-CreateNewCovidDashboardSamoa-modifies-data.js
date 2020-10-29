'use strict';

import { generateId, insertObject } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'WS_Covid_Country';

const DASHBOARD_REPORT = 'TO_COVID_Percent_IPC_Commodity_Availability';

const getOverlaysForGroup = (db, groupCode) => {
  return db.runSql(`
    select mo.* from "map_overlay_group" mog
    join map_overlay_group_relation mogr
    on mogr.map_overlay_group_id = mog.id
    join "mapOverlay" mo 
    on mo.id = mogr.child_id
    where mog.code = '${groupCode}';
  `);
};

exports.up = async function (db) {
  // 1. Add existing dashboard report to Samoa
  await db.runSql(`
    update "dashboardGroup" 
    set 
      "dashboardReports" = "dashboardReports" || '{${DASHBOARD_REPORT}}'
    where code = '${DASHBOARD_GROUP_CODE}';
  `);

  // 2. Add overlays to Samoa.
  const overlayResponse1 = await getOverlaysForGroup(db, 'COVID19_Commodity_Availability');
  const overlayResponse2 = await getOverlaysForGroup(db, 'COVID19_Facility_Commodities');
  const overlays = [...overlayResponse1.rows, ...overlayResponse2.rows];

  for (const overlay of overlays) {
    await db.runSql(`
      update "mapOverlay"
      set "countryCodes" = "countryCodes" || '{WS}'
      where id = '${overlay.id}';
    `);
  }

  // 3. Copy overlays so that the group name can be changed to Samoa without having duplicate groups
  const overlaysToCopy = (await getOverlaysForGroup(db, 'COVID19_Tonga')).rows;

  const mapOverlayGroupId = generateId();
  await insertObject(db, 'map_overlay_group', {
    id: mapOverlayGroupId,
    name: 'COVID-19 Samoa',
    code: 'COVID19_Samoa',
  });

  for (const overlayObject of overlaysToCopy) {
    const id = `Samoa_${overlayObject.id}`;

    // eslint-disable-next-line no-param-reassign
    delete overlayObject.linkedMeasures;
    await insertObject(db, 'mapOverlay', {
      ...overlayObject,
      projectCodes: '{fanafana,explore}', // Adding the new overlays to fanafana for consistency.
      id,
      countryCodes: '{WS}',
    });
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: mapOverlayGroupId,
      child_id: id,
      child_type: 'mapOverlay',
    });
  }
};

exports.down = async function (db) {
  // 1. Delete existing dashboard report from Samoa
  await db.runSql(`
    update "dashboardGroup" 
    set 
      "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD_REPORT}')
    where code = '${DASHBOARD_GROUP_CODE}';
  `);

  // 2. Remove 'WS' from COVID-19 overlays
  const overlayResponse1 = await getOverlaysForGroup(db, 'COVID19_Commodity_Availability');
  const overlayResponse2 = await getOverlaysForGroup(db, 'COVID19_Facility_Commodities');
  const overlays = [...overlayResponse1.rows, ...overlayResponse2.rows];

  for (const overlay of overlays) {
    await db.runSql(`
      update "mapOverlay"
      set "countryCodes" = array_remove("countryCodes", 'WS')
      where id = '${overlay.id}';
    `);
  }

  // 3. Delete duplicated map overlays and new overlay group
  const overlaysToDelete = (await getOverlaysForGroup(db, 'COVID19_Tonga')).rows;

  for (const overlayObject of overlaysToDelete) {
    const id = `Samoa_${overlayObject.id}`;

    await db.runSql(`delete from "map_overlay_group_relation" where child_id = '${id}'`);
    await db.runSql(`delete from "mapOverlay" where id = '${id}'`);
  }

  await db.runSql(`delete from "map_overlay_group" where code = 'COVID19_Samoa'`);
};

exports._meta = {
  version: 1,
};
