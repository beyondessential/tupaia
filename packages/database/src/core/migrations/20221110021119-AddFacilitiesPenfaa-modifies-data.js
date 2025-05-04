'use strict';

const { generateId, nameToId } = require('../utilities');

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

// Current hierarchy
// country
//  |- district
//      |- sub_district
//          |- ...

// New hierarchy
// country
//  |- district
//      |- facility <-- add facilities to alt. hierarchy. All facilities already exist.
//          |- sub_district
//              |- ...

const HIERARCHY_CODE = 'penfaa_samoa';

// a subset of facilities in Samoa
const FACILITIES = [
  // parent_code code
  ['WS_Upolu', 'WS_001'],
  ['WS_Savaii', 'WS_002'],
  ['WS_Upolu', 'WS_003'],
  ['WS_Upolu', 'WS_004'],
  ['WS_Upolu', 'WS_005'],
  ['WS_Savaii', 'WS_006'],
  ['WS_Upolu', 'WS_007'],
  ['WS_Upolu', 'WS_008'],
  ['WS_Savaii', 'WS_009'],
  ['WS_Savaii', 'WS_011'],
  ['WS_Savaii', 'WS_012'],
  ['WS_Upolu', 'WS_014'],
];

const SUB_DISTRICTS = [
  // parent_code code
  ['WS_004', 'WS_sd01'],
  ['WS_004', 'WS_sd02'],
  ['WS_004', 'WS_sd03'],
  ['WS_004', 'WS_sd04'],
  ['WS_001', 'WS_sd05'],
  ['WS_011', 'WS_sd06'],
  ['WS_003', 'WS_sd07'],
  ['WS_003', 'WS_sd08'],
  ['WS_005', 'WS_sd09'],
  ['WS_005', 'WS_sd10'],
  ['WS_006', 'WS_sd11'],
  ['WS_006', 'WS_sd12'],
  ['WS_006', 'WS_sd13'],
  ['WS_006', 'WS_sd14'],
  ['WS_006', 'WS_sd15'],
  ['WS_007', 'WS_sd16'],
  ['WS_007', 'WS_sd17'],
  ['WS_011', 'WS_sd18'],
  ['WS_014', 'WS_sd19'],
  ['WS_014', 'WS_sd20'],
  ['WS_014', 'WS_sd21'],
  ['WS_014', 'WS_sd22'],
  ['WS_001', 'WS_sd23'],
  ['WS_009', 'WS_sd24'],
  ['WS_009', 'WS_sd25'],
  ['WS_009', 'WS_sd26'],
  ['WS_009', 'WS_sd27'],
  ['WS_009', 'WS_sd28'],
  ['WS_008', 'WS_sd29'],
  ['WS_003', 'WS_sd30'],
  ['WS_003', 'WS_sd31'],
  ['WS_002', 'WS_sd32'],
  ['WS_012', 'WS_sd33'],
  ['WS_012', 'WS_sd34'],
  ['WS_008', 'WS_sd35'],
  ['WS_008', 'WS_sd36'],
  ['WS_004', 'WS_sd37'],
  ['WS_004', 'WS_sd38'],
  ['WS_004', 'WS_sd39'],
  ['WS_004', 'WS_sd40'],
  ['WS_002', 'WS_sd41'],
  ['WS_002', 'WS_sd42'],
  ['WS_012', 'WS_sd43'],
  ['WS_008', 'WS_sd44'],
  ['WS_005', 'WS_sd45'],
  ['WS_014', 'WS_sd46'],
  ['WS_014', 'WS_sd47'],
  ['WS_014', 'WS_sd48'],
  ['WS_014', 'WS_sd49'],
  ['WS_011', 'WS_sd50'],
  ['WS_011', 'WS_sd51'],
];

exports.up = async function (db) {
  const entityHierarchyId = await nameToId(db, 'entity_hierarchy', HIERARCHY_CODE);

  for (const [parentSubDistrictCode, facilityCode] of FACILITIES) {
    await db.runSql(`
      INSERT INTO entity_relation (id, parent_id, child_id, entity_hierarchy_id) 
      VALUES (
        '${generateId()}', 
        (SELECT id FROM entity WHERE code = '${parentSubDistrictCode}'),
        (SELECT id FROM entity WHERE code = '${facilityCode}'),
        '${entityHierarchyId}'
      )
    `);
  }

  for (const [parentFacilityCode, subDistrictCode] of SUB_DISTRICTS) {
    await db.runSql(`
      UPDATE entity_relation
      SET parent_id = (SELECT id FROM entity WHERE code = '${parentFacilityCode}')
      WHERE child_id = (SELECT id FROM entity WHERE code = '${subDistrictCode}')
        AND entity_hierarchy_id = '${entityHierarchyId}'
    `);
  }
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
