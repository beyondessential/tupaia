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

const NEW_OVERLAY_GROUP_ID = generateId();

// this contains shared properties across all overlays
const BASE_OVERLAY = {
  userGroup: 'FETP Graduates',
  isDataRegional: true,
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'individual',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    displayType: 'color',
    measureLevel: 'Individual',
  },
  countryCodes: '{PG,SB}',
  projectCodes: '{fetp}',
};

const OVERLAYS_TO_IMPORT = [
  {
    id: 'FETPNG_Grad_Expertise_Animal_health',
    name: 'Animal health',
    dataElementCode: 'FETPNG20Data_012',
  },
  {
    id: 'FETPNG_Grad_Expertise_Community_engagement',
    name: 'Community engagement',
    dataElementCode: 'FETPNG20Data_013',
  },
  {
    id: 'FETPNG_Grad_Expertise_Data_analysis',
    name: 'Data analysis',
    dataElementCode: 'FETPNG20Data_014',
  },
  {
    id: 'FETPNG_Grad_Expertise_Data_management',
    name: 'Data management',
    dataElementCode: 'FETPNG20Data_015',
  },
  {
    id: 'FETPNG_Grad_Expertise_Environmental_health',
    name: 'Environmental health',
    dataElementCode: 'FETPNG20Data_016',
  },
  {
    id: 'FETPNG_Grad_Expertise_EPI',
    name: 'EPI',
    dataElementCode: 'FETPNG20Data_017',
  },
  {
    id: 'FETPNG_Grad_Expertise_HIV',
    name: 'HIV',
    dataElementCode: 'FETPNG20Data_018',
  },
  {
    id: 'FETPNG_Grad_Expertise_Lab',
    name: 'Lab',
    dataElementCode: 'FETPNG20Data_019',
  },
  {
    id: 'FETPNG_Grad_Expertise_Malaria',
    name: 'Malaria',
    dataElementCode: 'FETPNG20Data_020',
  },
  {
    id: 'FETPNG_Grad_Expertise_MCH',
    name: 'MCH',
    dataElementCode: 'FETPNG20Data_021',
  },
  {
    id: 'FETPNG_Grad_Expertise_NCDs',
    name: 'NCDs',
    dataElementCode: 'FETPNG20Data_022',
  },
  {
    id: 'FETPNG_Grad_Expertise_NTD',
    name: 'NTD',
    dataElementCode: 'FETPNG20Data_023',
  },
  {
    id: 'FETPNG_Grad_Expertise_Operational_research',
    name: 'Operational research',
    dataElementCode: 'FETPNG20Data_024',
  },
  {
    id: 'FETPNG_Grad_Expertise_Other_research',
    name: 'Other research',
    dataElementCode: 'FETPNG20Data_025',
  },
  {
    id: 'FETPNG_Grad_Expertise_Outbreak_response',
    name: 'Outbreak response',
    dataElementCode: 'FETPNG20Data_026',
  },
  {
    id: 'FETPNG_Grad_Expertise_Surveillance',
    name: 'Surveillance',
    dataElementCode: 'FETPNG20Data_027',
  },
  {
    id: 'FETPNG_Grad_Expertise_TB',
    name: 'TB',
    dataElementCode: 'FETPNG20Data_028',
  },
  {
    id: 'FETPNG_Grad_Expertise_Team_leadership',
    name: 'Team leadership',
    dataElementCode: 'FETPNG20Data_029',
  },
  {
    id: 'FETPNG_Grad_Expertise_Village_family_health',
    name: 'Village and family health',
    dataElementCode: 'FETPNG20Data_045',
  },
  {
    id: 'FETPNG_Grad_Expertise_Social_mobilization',
    name: 'Social mobilization',
    dataElementCode: 'FETPNG20Data_046',
  },
  {
    id: 'FETPNG_Grad_Expertise_	Health_promotion',
    name: 'Health promotion',
    dataElementCode: 'FETPNG20Data_047',
  },
  {
    id: 'FETPNG_Grad_Expertise_Other',
    name: 'Other',
    dataElementCode: 'FETPNG20Data_030',
  },
];

const NEW_OVERLAY_GROUP = {
  id: `${NEW_OVERLAY_GROUP_ID}`,
  name: 'Graduate by area of expertise',
  code: 'FETPNG_Grad_area_of_expertise',
};

const NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY = {
  map_overlay_group_id: `${NEW_OVERLAY_GROUP_ID}`,
  child_type: 'mapOverlay',
  sort_order: '0',
};

const NEW_OVERLAY_GROUP_RELATION_FOR_NEW_GROUP = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_id: `${NEW_OVERLAY_GROUP_ID}`,
  child_type: 'mapOverlayGroup',
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', NEW_OVERLAY_GROUP);
  await insertObject(db, 'map_overlay_group_relation', NEW_OVERLAY_GROUP_RELATION_FOR_NEW_GROUP);

  OVERLAYS_TO_IMPORT.forEach(({ id, name, dataElementCode }) => {
    const overlay = {
      ...BASE_OVERLAY,
      id,
      name,
      dataElementCode,
    };
    insertObject(db, 'mapOverlay', overlay);
    insertObject(db, 'map_overlay_group_relation', {
      ...NEW_OVERLAY_GROUP_RELATION_FOR_OVERLAY,
      id: generateId(),
      child_id: `${overlay.id}`,
    });
  });
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" in
    (SELECT "id" from "map_overlay_group" WHERE "code" = 'FETPNG_Grad_area_of_expertise');
  `);

  OVERLAYS_TO_IMPORT.forEach(async overlay => {
    await db.runSql(`
      DELETE FROM "mapOverlay" WHERE "id"='${overlay.id}';

      DELETE FROM "map_overlay_group_relation"
      WHERE "child_id" ='${overlay.id}';
    `);
  });

  await db.runSql(`
  DELETE FROM "map_overlay_group" WHERE "code" = 'FETPNG_Grad_area_of_expertise';
`);
};

exports._meta = {
  "version": 1
};
