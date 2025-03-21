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

const REPORT_CODE = 'AU_FLUTRACKING_Percentage_Non_First_Nations_ILI';

const PERMISSION_GROUP = 'Donor';

const REPORT = {
  id: generateId(),
  code: REPORT_CODE,
  config: {
    fetch: {
      aggregations: [
        'FINAL_EACH_DAY',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'postcode',
            aggregationEntityType: 'district',
          },
        },
        'MOST_RECENT',
      ],
      dataElements: ['FWV_PC_004b', 'FWV_PC_003b'],
    },
    transform: [
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        organisationUnit: 'group',
        '...': 'last',
      },
      {
        transform: 'select',
        "'organisationUnitCode'": '$row.organisationUnit',
        "'value'": 'divide($row.FWV_PC_004b, $row.FWV_PC_003b)',
        "'non-First Nations participants'": '$row.FWV_PC_003b',
        "'non-First Nations participants with influenza like illness (ILI)'": '$row.FWV_PC_004b',
      },
    ],
  },
  permission_group_id: null,
};

const MAP_OVERLAY = {
  id: REPORT_CODE,
  name: '% of non-First Nations participants with influenza like illness (ILI)',
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: REPORT_CODE,
  },
  presentationOptions: {
    scaleType: 'performanceDesc',
    displayType: 'shaded-spectrum',
    measureLevel: 'District',
    valueType: 'percentage',
    scaleBounds: {
      left: {
        max: 0,
        min: 0,
      },
      right: {
        max: 0.035,
        min: 0.035,
      },
    },
    measureConfig: {
      $all: {
        type: 'popup-only',
        hideFromLegend: true,
      },
    },
    periodGranularity: 'one_week_at_a_time',
  },
  countryCodes: '{"AU"}',
  projectCodes: '{covidau,explore}',
};

const MAP_OVERLAY_GROUP_CODE = 'Flutracking_Australia';

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
