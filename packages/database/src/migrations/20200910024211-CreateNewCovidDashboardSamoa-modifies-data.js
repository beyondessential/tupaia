'use strict';

import { codeToId, insertObject, db, generateId } from '../utilities';

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

const PROJECT_CODE = 'explore';
const DASHBOARD_GROUP_NAME = 'COVID-19';
const DASHBOARD_GROUP_CODE = 'WS_Covid_Country';
const NEW_USER_GROUP = 'Donor';
const OLD_USER_GROUP = 'COVID-19';

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

exports.up = async function(db) {
  // 1. Add new overlay to Samoa
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

  overlays.forEach(({ id }) => {
    db.runSql(`
      update "mapOverlay"
      set "countryCodes" = "countryCodes" || '{WS}'
      where id = '${id}';
    `);
  });

  // 3. Copy overlays so that the group name can be changed to Samoa (because permissions are overlay based).
  const overlaysToCopy = (await getOverlaysForGroup(db, 'COVID19_Tonga')).rows;

  const mapOverlayGroupId = generateId();
  insertObject(db, 'map_overlay_group', {
    id: mapOverlayGroupId,
    name: 'COVID-19 Samoa',
    code: 'COVID19_Samoa',
  });

  overlaysToCopy.forEach(overlayObject => {
    const id = `Samoa_${overlayObject.id}`;

    // eslint-disable-next-line no-param-reassign
    delete overlayObject.linkedMeasures;
    insertObject(db, 'mapOverlay', {
      ...overlayObject,
      projectCodes: '{fanafana,explore}',
      id,
      countryCodes: '{WS}',
    });
    insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: mapOverlayGroupId,
      child_id: id,
      child_type: 'mapOverlay',
    });
  });
};

exports.down = async function(db) {
  await db.runSql(`
    update "dashboardGroup" 
    set 
      "dashboardReports" = array_remove("dashboardReports", '${DASHBOARD_REPORT}')
    where code = '${DASHBOARD_GROUP_CODE}';
  `);

  const overlayResponse1 = await getOverlaysForGroup(db, 'COVID19_Commodity_Availability');
  const overlayResponse2 = await getOverlaysForGroup(db, 'COVID19_Facility_Commodities');
  const overlays = [...overlayResponse1.rows, ...overlayResponse2.rows];

  overlays.forEach(({ id }) => {
    db.runSql(`
      update "mapOverlay"
      set "countryCodes" = array_remove("countryCodes", 'WS')
      where id = '${id}';
    `);
  });

  const overlaysToDelete = (await getOverlaysForGroup(db, 'COVID19_Tonga')).rows;

  overlaysToDelete.forEach(overlayObject => {
    const id = `Samoa_${overlayObject.id}`;

    db.runSql(`delete from "map_overlay_group_relation" where child_id = '${id}'`);
    db.runSql(`delete from "mapOverlay" where id = '${id}'`);
  });

  db.runSql(`delete from "map_overlay_group" where code = 'COVID19_Samoa'`);
};

exports._meta = {
  version: 1,
};
