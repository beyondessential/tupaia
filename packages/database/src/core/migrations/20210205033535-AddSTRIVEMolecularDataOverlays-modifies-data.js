'use strict';

import { insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

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

const BASE_OVERLAY = {
  userGroup: 'STRIVE User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'countEventsPerOrgUnit',
  presentationOptions: {
    values: [
      {
        value: 'other',
        color: 'blue',
      },
      {
        value: null,
        color: 'grey',
      },
    ],
    displayType: 'radius',
    measureLevel: 'Facility',
    hideFromLegend: true,
  },
  countryCodes: '{PG}',
  projectCodes: '{strive,explore}',
};

const OVERLAYS_TO_IMPORT = [
  {
    id: 'PG_STRIVE_QMAL05_Positive',
    name: 'QMAL Positive',
    dataElementCode: 'STR_QMAL05',
    programCode: 'SQMAL',
  },
  {
    id: 'PG_STRIVE_PF05_Positive',
    name: 'PCR Pf Positive',
    dataElementCode: 'STR_PF05',
    programCode: 'SPF',
  },
  {
    id: 'PG_STRIVE_PV05_Positive',
    name: 'PCR Pv Positive',
    dataElementCode: 'STR_PV05',
    programCode: 'SPV',
  },
  {
    id: 'PG_STRIVE_PM05_Positive',
    name: 'PCR Pm Positive',
    dataElementCode: 'STR_PM05',
    programCode: 'SPM',
  },
  {
    id: 'PG_STRIVE_PO05_Positive',
    name: 'PCR Po Positive',
    dataElementCode: 'STR_PO05',
    programCode: 'SPO',
  },
];

exports.up = async function (db) {
  const STRIVE_MOLECULAR_DATA_ID = await db.runSql(`
     SELECT "id" FROM "map_overlay_group" WHERE "code" = 'STRIVE_Molecular_Data';
  `);

  OVERLAYS_TO_IMPORT.forEach(({ id, name, dataElementCode, programCode }) => {
    const overlay = {
      ...BASE_OVERLAY,
      id,
      name,
      measureBuilderConfig: {
        dataValues: {
          [dataElementCode]: 1,
        },
        programCode,
        entityAggregation: {
          aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
          dataSourceEntityType: 'village',
          aggregationEntityType: 'facility',
        },
      },
    };
    const relationship = {
      id: generateId(),
      map_overlay_group_id: `${STRIVE_MOLECULAR_DATA_ID.rows[0].id}`,
      child_id: `${overlay.id}`,
      child_type: 'mapOverlay',
      sort_order: '0',
    };
    insertObject(db, 'mapOverlay', overlay);
    insertObject(db, 'map_overlay_group_relation', relationship);
  });
};

exports.down = async function (db) {
  const STRIVE_MOLECULAR_DATA_ID = await db.runSql(`
    SELECT "id" FROM "map_overlay_group" WHERE "code" = 'STRIVE_Molecular_Data';
  `);

  OVERLAYS_TO_IMPORT.forEach(async overlay => {
    await db.runSql(`
      DELETE FROM "mapOverlay" WHERE "id"='${overlay.id}';

      DELETE FROM "map_overlay_group_relation"
      WHERE "map_overlay_group_id" = '${STRIVE_MOLECULAR_DATA_ID.rows[0].id}'
      AND "child_id" ='${overlay.id}';
    `);
  });
};

exports._meta = {
  version: 1,
};
