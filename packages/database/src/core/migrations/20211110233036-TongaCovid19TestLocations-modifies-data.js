'use strict';

import { generateId, codeToId, insertObject } from '../utilities';

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

const reportCode = 'COVID_19_Tonga_Test_Locations_map';
const MAP_OVERLAY_GROUP_CODE = 'COVID19_Tonga';

const reportRecord = {
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataGroups: ['LRF_TO'],
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'village',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        exclude: ['event', 'eventDate', 'orgUnitName', 'orgUnit'],
        insert: {
          organisationUnitCode: '=$orgUnit',
          value: '=1',
        },
      },
      {
        transform: 'mergeRows',
        groupBy: 'organisationUnitCode',
        using: 'sum',
      },
    ],
  },
  permission_group_id: '5e8a9e2961f76a32a10881c4',
};

const mapOverlayRecord = {
  id: generateId(),
  name: 'COVID-19 Test Locations',
  code: 'COVID_19_Tonga_Test_Locations',
  permission_group: 'COVID-19 Senior',
  data_services: [{ isDataRegional: false }],
  config: {
    customLabel: 'Total COVID-19 Swabs',
    displayType: 'shaded-spectrum',
    scaleType: 'performance',
    measureLevel: 'Village',
    hideFromLegend: false,
    hideByDefault: { null: true },
    scaleBounds: {
      left: {
        max: 'auto',
      },
      right: {
        min: 'auto',
      },
    },
  },
  country_codes: '{"TO"}',
  project_codes: '{fanafana}',
  report_code: reportCode,
};

exports.up = async function (db) {
  // add mapOverlay record to map_overlay
  await insertObject(db, 'map_overlay', mapOverlayRecord);
  // add report record to report
  await insertObject(db, 'report', reportRecord);
  // look up map overlay group code
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', MAP_OVERLAY_GROUP_CODE);
  // add mapoverlay to map_over_group_relation
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlayRecord.id,
    child_type: 'mapOverlay',
  });
};

exports.down = async function (db) {
  // lookup map overlay id
  const mapOverlayId = await codeToId(db, 'map_overlay', mapOverlayRecord.code);
  // delete mapoverlay from group relations
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${mapOverlayId}';
  `);
  // delete map overlay from map_overlay
  await db.runSql(`
  DELETE FROM "map_overlay" WHERE "id" = '${mapOverlayId}';
  `);
  // delete report from report
  await db.runSql(`
  DELETE FROM "report" WHERE "code" = '${reportCode}';
  `);
};

exports._meta = {
  version: 1,
};
