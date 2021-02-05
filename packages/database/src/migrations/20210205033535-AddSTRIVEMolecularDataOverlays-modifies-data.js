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
exports.setup = function(options, seedLink) {
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

const STR_QMAL05_OVERLAY = {
  ...BASE_OVERLAY,
  id: generateId(),
  name: 'QMAL Positive',
  measureBuilderConfig: {
    dataValues: {
      STR_QMAL05: 1,
    },
    programCode: 'SQMAL',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
};

const STR_PF05_OVERLAY = {
  ...BASE_OVERLAY,
  id: generateId(),
  name: 'PCR Pf Positive',
  measureBuilderConfig: {
    dataValues: {
      STR_PF05: 1,
    },
    programCode: 'SPF',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
};

const STR_PV05_OVERLAY = {
  ...BASE_OVERLAY,
  id: generateId(),
  name: 'PCR Pv Positive',
  measureBuilderConfig: {
    dataValues: {
      STR_PV05: 1,
    },
    programCode: 'SPV',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
};

const STR_PM05_OVERLAY = {
  ...BASE_OVERLAY,
  id: generateId(),
  name: 'PCR Pm Positive',
  measureBuilderConfig: {
    dataValues: {
      STR_PM05: 1,
    },
    programCode: 'SPM',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
};

const STR_PO05_OVERLAY = {
  ...BASE_OVERLAY,
  id: generateId(),
  name: 'PCR Po Positive',
  measureBuilderConfig: {
    dataValues: {
      STR_PO05: 1,
    },
    programCode: 'SPO',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
};

const OVERLAYS_TO_IMPORT = [
  STR_QMAL05_OVERLAY,
  STR_PF05_OVERLAY,
  STR_PV05_OVERLAY,
  STR_PM05_OVERLAY,
  STR_PO05_OVERLAY,
];

exports.up = async function (db) {
  const STRIVE_MOLECULAR_DATA_ID = await db.runSql(`
     SELECT "id" FROM "map_overlay_group" WHERE "code" = 'STRIVE_Molecular_Data';
  `);

  OVERLAYS_TO_IMPORT.forEach(overlay => {
    const MAP_OVERLAY_RELATION_ID = generateId();

    insertObject(db, 'mapOverlay', overlay);

    db.runSql(`
    INSERT INTO "map_overlay_group_relation" ("id", "map_overlay_group_id", "child_id", "child_type", "sort_order")
    VALUES ('${MAP_OVERLAY_RELATION_ID}', '${STRIVE_MOLECULAR_DATA_ID.rows[0].id}', '${overlay.id}', 'mapOverlay', '0');
    `);
  });
};

exports.down = async function (db) {
  const STRIVE_MOLECULAR_DATA_ID = await db.runSql(`
    SELECT "id" FROM "map_overlay_group" WHERE "code" = 'STRIVE_Molecular_Data';
  `);

  OVERLAYS_TO_IMPORT.forEach(async overlay => {
    const OVERLAY_ID_TO_DELETE = await db.runSql(`
      SELECT "id" FROM "mapOverlay" WHERE "name" = '${overlay.name}';
    `);

    await db.runSql(`
      DELETE FROM "mapOverlay" WHERE "id"='${OVERLAY_ID_TO_DELETE.rows[0].id}';

      DELETE FROM "map_overlay_group_relation"
      WHERE "map_overlay_group_id" = '${STRIVE_MOLECULAR_DATA_ID.rows[0].id}'
      AND "child_id" ='${OVERLAY_ID_TO_DELETE.rows[0].id}';
    `);
  });
};

exports._meta = {
  "version": 1
};
