'use strict';

import { insertObject } from '../utilities';

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

const MAP_OVERLAY_ID = 'Laos_Schools_Dormitory_Schools';
const DATA_ELEMENT_CODE = 'SchFF003';

const MAP_OVERLAY = {
  id: MAP_OVERLAY_ID,
  name: 'Dormitory Schools',
  groupName: 'Laos Schools',
  userGroup: 'Laos Schools User',
  dataElementCode: DATA_ELEMENT_CODE,
  displayType: 'color',
  isDataRegional: true,
  values: [
    {
      name: 'Yes',
      color: 'green',
      value: 'Yes',
    },
    {
      name: 'No',
      color: 'grey',
      value: 'No',
    },
    {
      name: 'No',
      color: 'grey',
      value: null,
    },
  ],
  measureBuilder: 'valueForOrgGroup',
  measureBuilderConfig: {
    aggregationEntityType: 'school',
    dataSourceEntityType: 'school',
    dataElementCodes: [DATA_ELEMENT_CODE],
  },
  sortOrder: 0,
  presentationOptions: {
    displayOnLevel: 'District',
    hideByDefault: { 0: true, null: true },
  },
  countryCodes: '{"LA"}',
};

exports.up = async function (db) {
  return insertObject(db, 'mapOverlay', MAP_OVERLAY);
};

exports.down = function (db) {
  return db.runSql(`DELETE FROM "mapOverlay" WHERE "id" = '${MAP_OVERLAY_ID}'`);
};

exports._meta = {
  version: 1,
};
