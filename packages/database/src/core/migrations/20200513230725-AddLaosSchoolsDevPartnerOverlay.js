'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const MAP_OVERLAY_ID_PREFIX = 'Laos_Schools_Dev_Partner_';

const DEV_PARTNERS_OVERLAYS = [
  { dataElementCode: 'SchDP_AEAL', name: 'Aide et Action Laos (AEAL)' },
  { dataElementCode: 'SchDP_CRS', name: 'Catholic Relief Services (CRS)' },
  { dataElementCode: 'SchDP_HII', name: 'Humanity & Inclusion - Handicap International' },
  { dataElementCode: 'SchDP_Plan', name: 'Plan International' },
  { dataElementCode: 'SchDP_RtR', name: 'Room to Read' },
  { dataElementCode: 'SchDP_UNIC', name: 'EF UNICEF' },
  { dataElementCode: 'SchDP_WB', name: 'World Bank' },
  { dataElementCode: 'SchDP_WC', name: 'World Concern Laos' },
  { dataElementCode: 'SchDP_WFP', name: 'World Food Programme (WFP)' },
  { dataElementCode: 'SchDP_WR', name: 'World Renew' },
  { dataElementCode: 'SchDP_WV', name: 'World Vision' },
];

const BASE_CONFIG = {
  groupName: 'Development Partner',
  userGroup: 'Laos Schools User',
  displayType: 'color',
  isDataRegional: true,
  values: [
    {
      name: 'School Supported',
      color: 'green',
      value: 'Yes',
    },
    {
      name: 'School Not Supported',
      color: 'grey',
      value: 'No',
    },
    {
      name: 'School Not Supported',
      color: 'grey',
      value: null,
    },
  ],
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    displayOnLevel: 'District',
    hideByDefault: { 0: true, null: true },
  },
  countryCodes: '{"LA"}',
};

const measureBuilderConfig = dataElementCode => {
  return {
    aggregationEntityType: 'school',
    dataSourceEntityType: 'school',
    dataElementCodes: [dataElementCode],
  };
};

const buildRow = (overlay, index) => {
  const { name, id, dataElementCode } = overlay;
  return {
    ...BASE_CONFIG,
    name,
    id: `${MAP_OVERLAY_ID_PREFIX}${dataElementCode}`,
    dataElementCode,
    sortOrder: index,
    measureBuilderConfig: measureBuilderConfig(dataElementCode),
  };
};

exports.up = async function (db) {
  await Promise.all(
    DEV_PARTNERS_OVERLAYS.map((overlay, index) => {
      return insertObject(db, 'mapOverlay', buildRow(overlay, index));
    }),
  );
};

exports.down = function (db) {
  return db.runSql(`DELETE FROM "mapOverlay" 
                    WHERE "id" in (${arrayToDbString(
                      DEV_PARTNERS_OVERLAYS.map(
                        o => `${MAP_OVERLAY_ID_PREFIX}${o.dataElementCode}`,
                      ),
                    )});	
                  `);
};

exports._meta = {
  version: 1,
};
