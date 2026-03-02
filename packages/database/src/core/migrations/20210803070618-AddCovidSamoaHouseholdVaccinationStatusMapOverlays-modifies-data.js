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

const REPORT_CODE = 'WS_COVID_Household_Vaccination_Status';

const PERMISSION_GROUP = 'COVID-19';

const REPORT = {
  id: generateId(),
  code: REPORT_CODE,
  config: {
    fetch: {
      aggregations: [{ type: 'MOST_RECENT', config: { dataSourceEntityType: 'household' } }],
      dataElements: ['HVS_covidstatus'],
    },
    transform: [
      'keyValueByDataElementName',
      {
        transform: 'filter',
        where: "$row.HVS_covidstatus != 'Fully vaccinated'",
      },
      {
        transform: 'select',
        "'organisationUnitCode'": '$row.organisationUnit',
        "'value'": '$row.HVS_covidstatus',
      },
    ],
  },
};

const MAP_OVERLAY = {
  id: REPORT_CODE,
  name: 'Household Vaccination Status',
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode: REPORT_CODE,
  },
  presentationOptions: {
    displayType: 'icon',
    measureLevel: 'Household',
    displayOnLevel: 'SubDistrict',
    values: [
      {
        icon: 'circle',
        name: 'Partially vaccinated',
        value: 'Partially vaccinated',
        color: 'orange',
      },
      {
        icon: 'circle',
        name: 'Unvaccinated',
        value: 'Unvaccinated',
        color: 'red',
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
    hideByDefault: {
      null: true,
    },
  },
  countryCodes: '{"WS"}',
  projectCodes: '{covid_samoa}',
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
