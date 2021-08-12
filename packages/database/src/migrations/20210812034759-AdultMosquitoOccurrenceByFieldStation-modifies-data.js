'use strict';

import { insertObject, generateId } from '../utilities';

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

const REPORT_CODE = 'PMOS_Distribution_Of_Aedes';

const PERMISSION_GROUP = 'wish';

const REPORT = {
  id: generateId(),
  code: REPORT_CODE,
  config: {
    fetch: {
      fetch: {
        aggregations: [
          {
            type: 'SUM_PER_ORG_GROUP',
            config: {
              dataSourceEntityType: 'field_station',
              aggregationEntityType: 'country',
            },
          },
        ],
        dataElements: ['PMOS_Aedes'],
      },
      transform: [],
    },
  },
};

const MAP_OVERLAY = {
  id: REPORT_CODE,
  name: 'Distribution of Aedes',
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: REPORT_CODE,
  },
  presentationOptions: {
    values: [
      {
        icon: 'circle',
        name: 'Detected',
        value: '>0',
        hideFromLegend: false,
      },
      {
        icon: 'circle',
        name: 'Not Detected',
        value: '0',
        hideFromLegend: false,
      },
      {
        icon: 'circle',
        name: 'No Data',
        value: 'null',
        hideFromLegend: false,
      },
    ],
    displayType: 'icon',
    measureLevel: 'Facility',
    hideFromPopup: true,
    measureConfig: {
      $all: {
        type: 'icon',
        values: [
          {
            icon: 'circle',
            value: 'other',
            hideFromLegend: true,
          },
          {
            icon: 'circle',
            name: 'No data',
            color: 'Grey',
            value: 'null',
            hideFromPopup: true,
            hideFromLegend: true,
          },
        ],
        measureLevel: 'Facility',
      },
    },
  },
  countryCodes: '{"SB"}',
  projectCodes: '{wish}',
};

const MAP_OVERLAY_GROUP_CODE = 'COVID19_Samoa';

const getMapOverlayGroupId = async function (db, code) {
  const results = await db.runSql(`select "id" from "map_overlay_group" where "code" = '${code}';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('MapOverlayGroup not found');
};

const mapOverlayGroupRelation = groupId => ({
  id: generateId(),
  map_overlay_group_id: groupId,
  child_id: MAP_OVERLAY.id,
  child_type: 'mapOverlay',
  sort_order: 0,
});

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const permissionGroupId = await permissionGroupNameToId(db, PERMISSION_GROUP);
  await insertObject(db, 'report', { ...REPORT, permission_group_id: permissionGroupId });
  await insertObject(db, 'mapOverlay', MAP_OVERLAY);
  const mapOverlayGroupId = await getMapOverlayGroupId(db, MAP_OVERLAY_GROUP_CODE);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation(mapOverlayGroupId));
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${MAP_OVERLAY.id}';
    DELETE FROM "mapOverlay" WHERE "id" = '${MAP_OVERLAY.id}';
    DELETE FROM "report" WHERE code = '${REPORT.code}';
  `);
};

exports._meta = {
  version: 1,
};
