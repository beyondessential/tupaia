'use strict';

import { insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const OVERLAY = {
  id: 'STRIVE_WTF_Consultations_Radius',
  name: '# Consultations',
  groupName: 'STRIVE PNG: Health Facility Data (Source: WTF)',
  userGroup: 'STRIVE User',
  dataElementCode: 'SSWT1001',
  displayType: 'radius',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: true,
  values: [
    { color: 'blue', value: 'other' },
    { color: 'grey', value: null },
  ],
  measureBuilder: 'valueForOrgGroup',
  measureBuilderConfig: {
    aggregationType: 'SUM',
    aggregationEntityType: 'facility',
  },
  countryCodes: '{"PG"}',
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', OVERLAY);
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" = '${OVERLAY.id}';	
  `,
  );
};

exports._meta = {
  version: 1,
};
