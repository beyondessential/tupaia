'use strict';

import { insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const BASE_OVERLAY = {
  groupName: 'COVID-19 Tonga',
  userGroup: 'COVID-19',
  dataElementCode: 'value',
  displayType: 'radius',
  isDataRegional: true,
  values: [
    { color: 'blue', value: 'other' },
    { color: 'grey', value: null },
  ],
  measureBuilder: 'sumLatestPerOrgUnit',
  countryCodes: '{"TO"}',
};

const OVERLAY_1 = {
  id: 'COVID_ICU_Beds',
  name: 'Number of ICU beds',
  measureBuilderConfig: {
    dataElementCodes: ['COVID-19FacAssTool_21'],
    aggregationEntityType: 'facility',
  },
};

const OVERLAY_2 = {
  id: 'COVID_Isolation_Beds',
  name: 'Number of Isolation beds',
  measureBuilderConfig: {
    dataElementCodes: ['COVID-19FacAssTool_22'],
    aggregationEntityType: 'facility',
  },
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return Promise.all([
    insertObject(db, 'mapOverlay', {
      ...BASE_OVERLAY,
      ...OVERLAY_1,
    }),
    insertObject(db, 'mapOverlay', {
      ...BASE_OVERLAY,
      ...OVERLAY_2,
    }),
  ]);
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" in ('${OVERLAY_1.id}', '${OVERLAY_2.id}');	
  `,
  );
};

exports._meta = {
  version: 1,
};
