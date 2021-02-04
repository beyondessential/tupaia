'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const MAP_OVERLAY_IDS = [
  'Laos_Schools_Dev_Partner_SchDP_AEAL',
  'Laos_Schools_Dev_Partner_SchDP_CRS',
  'Laos_Schools_Dev_Partner_SchDP_HII',
  'Laos_Schools_Dev_Partner_SchDP_Plan',
  'Laos_Schools_Dev_Partner_SchDP_RtR',
  'Laos_Schools_Dev_Partner_SchDP_UNIC',
  'Laos_Schools_Dev_Partner_SchDP_WB',
  'Laos_Schools_Dev_Partner_SchDP_WC',
  'Laos_Schools_Dev_Partner_SchDP_WFP',
  'Laos_Schools_Dev_Partner_SchDP_WR',
  'Laos_Schools_Dev_Partner_SchDP_WV',
];

const OLD_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'School Supported',
      color: 'green',
      value: 'Yes',
    },
    {
      name: 'School Not Supported',
      color: 'red',
      value: ['No', 'null'],
    },
  ],
  displayType: 'color',
  measureLevel: 'School',
  hideByDefault: {
    'No,null': true,
  },
  displayOnLevel: 'District',
  popupHeaderFormat: '{code}: {name}',
};

const NEW_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'School Supported',
      color: 'green',
      value: 1,
    },
    {
      name: 'School Not Supported',
      color: 'red',
      value: [0, 'null'],
    },
  ],
  displayType: 'color',
  measureLevel: 'School',
  hideByDefault: {
    '0,null': true,
  },
  displayOnLevel: 'District',
  popupHeaderFormat: '{code}: {name}',
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    update "mapOverlay" mo
    set "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update "mapOverlay" mo
    set "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);
};

exports._meta = {
  version: 1,
};
