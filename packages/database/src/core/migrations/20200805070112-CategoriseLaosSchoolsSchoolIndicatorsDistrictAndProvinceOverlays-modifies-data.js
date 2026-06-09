'use strict';

import { insertObject, generateId } from '../utilities';

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

const SCHOOL_INDICATORS_OVERLAY_GROUP = {
  id: generateId(),
  name: 'School Indicators EiE - Sub-national Levels',
  code: 'Laos_Schools_School_Indicators_EiE_Sub_National_Group',
};

const SCHOOL_INDICATORS_DISTRICT_OVERLAY_GROUP = {
  code: 'School_Indicators_by_District',
  oldName: 'School Indicators by District',
  newName: 'District Level',
};

const SCHOOL_INDICATORS_PROVINCE_OVERLAY_GROUP = {
  code: 'School_Indicators_by_Province',
  oldName: 'School Indicators by Province',
  newName: 'Province Level',
};

const selectSchoolIndicatorsDistrictLevelGroup = async db =>
  db.runSql(`
    SELECT * 
    FROM map_overlay_group 
    WHERE code = '${SCHOOL_INDICATORS_DISTRICT_OVERLAY_GROUP.code}';
  `);

const selectSchoolIndicatorsProvinceLevelGroup = async db =>
  db.runSql(`
    SELECT * 
    FROM map_overlay_group 
    WHERE code = '${SCHOOL_INDICATORS_PROVINCE_OVERLAY_GROUP.code}';
  `);

exports.up = async function (db) {
  const districtGroup = (await selectSchoolIndicatorsDistrictLevelGroup(db)).rows[0];
  const provinceGroup = (await selectSchoolIndicatorsProvinceLevelGroup(db)).rows[0];

  // Insert new top level 'School Indicators' group
  await insertObject(db, 'map_overlay_group', SCHOOL_INDICATORS_OVERLAY_GROUP);

  // Insert relation to nest the existing 'School Indicators in District' group under the new 'School Indicators' group above
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: SCHOOL_INDICATORS_OVERLAY_GROUP.id,
    child_id: districtGroup.id,
    child_type: 'mapOverlayGroup',
  });

  // Insert relation to nest the existing 'School Indicators in Province' group under the new 'School Indicators' group above
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: SCHOOL_INDICATORS_OVERLAY_GROUP.id,
    child_id: provinceGroup.id,
    child_type: 'mapOverlayGroup',
  });

  // Change the name 'School Indicators in District' to 'District Level'
  // Change the name 'School Indicators in Province' to 'Province Level'
  await db.runSql(`
    UPDATE map_overlay_group
    SET name = '${SCHOOL_INDICATORS_DISTRICT_OVERLAY_GROUP.newName}'
    WHERE id = '${districtGroup.id}';

    UPDATE map_overlay_group
    SET name = '${SCHOOL_INDICATORS_PROVINCE_OVERLAY_GROUP.newName}'
    WHERE id = '${provinceGroup.id}';
  `);
};

exports.down = async function (db) {
  const districtGroup = (await selectSchoolIndicatorsDistrictLevelGroup(db)).rows[0];
  const provinceGroup = (await selectSchoolIndicatorsProvinceLevelGroup(db)).rows[0];

  await db.runSql(`
    DELETE FROM map_overlay_group_relation
    WHERE child_id = '${districtGroup.id}';

    DELETE FROM map_overlay_group_relation
    WHERE child_id = '${provinceGroup.id}';

    DELETE FROM map_overlay_group
    WHERE code = '${SCHOOL_INDICATORS_OVERLAY_GROUP.code}';

    UPDATE map_overlay_group
    SET name = '${SCHOOL_INDICATORS_DISTRICT_OVERLAY_GROUP.oldName}'
    WHERE id = '${districtGroup.id}';

    UPDATE map_overlay_group
    SET name = '${SCHOOL_INDICATORS_PROVINCE_OVERLAY_GROUP.oldName}'
    WHERE id = '${provinceGroup.id}';
  `);
};

exports._meta = {
  version: 1,
};
