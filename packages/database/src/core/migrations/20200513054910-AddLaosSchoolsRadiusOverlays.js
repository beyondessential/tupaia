'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const BASE_OVERLAY = {
  groupName: 'Number of students',
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  displayType: 'radius',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  values: [
    { color: 'blue', value: 'other' },
    { color: 'grey', value: null },
  ],
  measureBuilder: 'sumLatestPerOrgUnit',
  presentationOptions: {
    displayOnLevel: 'District',
  },
  countryCodes: '{"LA"}',
};

const BASE_CONFIG = {
  dataSourceEntityType: 'school',
  aggregationEntityType: 'school',
};

const OVERLAYS = [
  {
    name: 'Total Students',
    id: 'LAOS_SCHOOLS_Total_Students',
    dataElementCodes: [...Array(34).keys()].map(
      int => `SchPop0${(int + 1).toString().padStart(2, '0')}`,
    ),
  },
  {
    name: 'Female Students',
    id: 'LAOS_SCHOOLS_Female_Students',
    dataElementCodes: [...Array(17).keys()].map(
      int => `SchPop0${(int * 2 + 1).toString().padStart(2, '0')}`,
    ),
  },
  {
    name: 'Male Students',
    id: 'LAOS_SCHOOLS_Male_Students',
    dataElementCodes: [...Array(17).keys()].map(
      int => `SchPop0${(int * 2 + 2).toString().padStart(2, '0')}`,
    ),
  },
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(
    OVERLAYS.map((overlay, index) => {
      const { name, id, dataElementCodes } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        name,
        id,
        measureBuilderConfig: { ...BASE_CONFIG, dataElementCodes },
        sortOrder: index,
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(OVERLAYS.map(o => o.id))});	
  `,
  );
};

exports._meta = {
  version: 1,
};
