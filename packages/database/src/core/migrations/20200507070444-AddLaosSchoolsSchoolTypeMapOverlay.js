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

const SCHOOLS_OVERLAY = {
  id: 'Laos_Schools_School_Type',
  name: 'School Type',
  groupName: 'Laos Schools',
  userGroup: 'Laos Schools User',
  dataElementCode: 'schoolTypeCode',
  displayType: 'color',
  isDataRegional: true,
  values: [
    {
      name: 'Pre-School',
      color: 'yellow',
      value: 'Pre-School',
    },
    {
      name: 'Primary',
      color: 'teal',
      value: 'Primary',
    },
    {
      name: 'Secondary',
      color: 'green',
      value: 'Secondary',
    },
  ],
  measureBuilder: 'valueForOrgGroup',
  measureBuilderConfig: {
    aggregationEntityType: 'school',
  },
  presentationOptions: {
    displayedValueKey: 'schoolTypeName',
    displayOnLevel: 'District',
  },
  countryCodes: '{"LA"}',
};

exports.up = function (db) {
  return insertObject(db, 'mapOverlay', SCHOOLS_OVERLAY);
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" = '${SCHOOLS_OVERLAY.id}';	
  `,
  );
};

exports._meta = {
  version: 1,
};
