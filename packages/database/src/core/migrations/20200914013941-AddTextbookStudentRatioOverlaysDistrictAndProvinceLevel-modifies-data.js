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

const POP_DATA_ELEMENTS = {
  // Primary school
  'Grade 1': ['SchPop011', 'SchPop012'],
  'Grade 2': ['SchPop013', 'SchPop014'],
  'Grade 3': ['SchPop015', 'SchPop016'],
  'Grade 4': ['SchPop017', 'SchPop018'],
  'Grade 5': ['SchPop019', 'SchPop020'],
  Primary: [
    'SchPop011',
    'SchPop012',
    'SchPop013',
    'SchPop014',
    'SchPop015',
    'SchPop016',
    'SchPop017',
    'SchPop018',
    'SchPop019',
    'SchPop020',
  ],

  // Secondary (lower)
  'Grade 6': ['SchPop021', 'SchPop022'],
  'Grade 7': ['SchPop023', 'SchPop024'],
  'Grade 8': ['SchPop025', 'SchPop026'],
  'Grade 9': ['SchPop027', 'SchPop028'],
  'Lower Sec': [
    'SchPop021',
    'SchPop022',
    'SchPop023',
    'SchPop024',
    'SchPop025',
    'SchPop026',
    'SchPop027',
    'SchPop028',
  ],

  // Secondary (upper)
  'Upper Sec': ['SchPop029', 'SchPop030', 'SchPop031', 'SchPop032', 'SchPop033', 'SchPop034'],
};

const OVERLAY_CONFIG = {
  primary: [
    // Lao Language
    // Average
    {
      numeratorCodes: ['STCL001', 'STCL020', 'STCL039', 'STCL058', 'STCL077'],
      denominatorCodes: POP_DATA_ELEMENTS.Primary,
      name: 'Lao Language - Average primary',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Primary',
    },
    // By grade
    {
      numeratorCodes: ['STCL001'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 1'],
      name: 'Lao Language - Grade 1',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_1',
    },
    {
      numeratorCodes: ['STCL020'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 2'],
      name: 'Lao Language - Grade 2',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_2',
    },
    {
      numeratorCodes: ['STCL039'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 3'],
      name: 'Lao Language - Grade 3',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_3',
    },
    {
      numeratorCodes: ['STCL058'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 4'],
      name: 'Lao Language - Grade 4',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_4',
    },
    {
      numeratorCodes: ['STCL077'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 5'],
      name: 'Lao Language - Grade 5',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_5',
    },

    // Mathematics
    // Average
    {
      numeratorCodes: ['STCL002', 'STCL021', 'STCL040', 'STCL059', 'STCL078'],
      denominatorCodes: POP_DATA_ELEMENTS.Primary,
      name: 'Mathematics - Average primary',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Primary',
    },
    // By grade
    {
      numeratorCodes: ['STCL002'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 1'],
      name: 'Mathematics - Grade 1',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_1',
    },
    {
      numeratorCodes: ['STCL021'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 2'],
      name: 'Mathematics - Grade 2',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_2',
    },
    {
      numeratorCodes: ['STCL040'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 3'],
      name: 'Mathematics - Grade 3',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_3',
    },
    {
      numeratorCodes: ['STCL059'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 4'],
      name: 'Mathematics - Grade 4',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_4',
    },
    {
      numeratorCodes: ['STCL078'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 5'],
      name: 'Mathematics - Grade 5',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_5',
    },

    // World Around Us
    // Average
    {
      numeratorCodes: ['STCL003', 'STCL022', 'STCL041', 'STCL060', 'STCL079'],
      denominatorCodes: POP_DATA_ELEMENTS.Primary,
      name: 'World Around Us - Average primary',
      baseId: 'Laos_Schools_World_Around_Us_Textbooks_Student_Ratio_Primary',
    },
    // By grade
    {
      numeratorCodes: ['STCL003'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 1'],
      name: 'World Around Us - Grade 1',
      baseId: 'Laos_Schools_World_Around_Us_Textbooks_Student_Ratio_Grade_1',
    },
    {
      numeratorCodes: ['STCL022'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 2'],
      name: 'World Around Us - Grade 2',
      baseId: 'Laos_Schools_World_Around_Us_Textbooks_Student_Ratio_Grade_2',
    },
    {
      numeratorCodes: ['STCL041'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 3'],
      name: 'World Around Us - Grade 3',
      baseId: 'Laos_Schools_World_Around_Us_Textbooks_Student_Ratio_Grade_3',
    },
    {
      numeratorCodes: ['STCL060'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 4'],
      name: 'World Around Us - Grade 4',
      baseId: 'Laos_Schools_World_Around_Us_Textbooks_Student_Ratio_Grade_4',
    },
    {
      numeratorCodes: ['STCL079'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 5'],
      name: 'World Around Us - Grade 5',
      baseId: 'Laos_Schools_World_Around_Us_Textbooks_Student_Ratio_Grade_5',
    },
  ],
  secondary: [
    // Lao Language
    // Average
    {
      numeratorCodes: ['STCL004', 'STCL023', 'STCL042', 'STCL061'],
      denominatorCodes: POP_DATA_ELEMENTS['Lower Sec'],
      name: 'Lao Language - Average lower secondary',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Lower_Secondary',
    },
    // By grade
    {
      numeratorCodes: ['STCL004'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 6'],
      name: 'Lao Language - Grade 6',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_6',
    },
    {
      numeratorCodes: ['STCL023'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 7'],
      name: 'Lao Language - Grade 7',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_7',
    },
    {
      numeratorCodes: ['STCL042'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 8'],
      name: 'Lao Language - Grade 8',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_8',
    },
    {
      numeratorCodes: ['STCL061'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 9'],
      name: 'Lao Language - Grade 9',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Grade_9',
    },

    // Mathematics
    // Average
    {
      numeratorCodes: ['STCL005', 'STCL024', 'STCL043', 'STCL062'],
      denominatorCodes: POP_DATA_ELEMENTS['Lower Sec'],
      name: 'Mathematics - Average lower secondary',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Lower_Secondary',
    },
    // By grade
    {
      numeratorCodes: ['STCL005'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 6'],
      name: 'Mathematics - Grade 6',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_6',
    },
    {
      numeratorCodes: ['STCL024'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 7'],
      name: 'Mathematics - Grade 7',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_7',
    },
    {
      numeratorCodes: ['STCL043'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 8'],
      name: 'Mathematics - Grade 8',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_8',
    },
    {
      numeratorCodes: ['STCL062'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 9'],
      name: 'Mathematics - Grade 9',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Grade_9',
    },

    // Natural Science
    // Average
    {
      numeratorCodes: ['STCL006', 'STCL025', 'STCL044', 'STCL063'],
      denominatorCodes: POP_DATA_ELEMENTS['Lower Sec'],
      name: 'Natural Science - Average lower secondary',
      baseId: 'Laos_Schools_Natural_Science_Textbooks_Student_Ratio_Lower_Secondary',
    },
    // By grade
    {
      numeratorCodes: ['STCL006'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 6'],
      name: 'Natural Science - Grade 6',
      baseId: 'Laos_Schools_Natural_Science_Textbooks_Student_Ratio_Grade_6',
    },
    {
      numeratorCodes: ['STCL025'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 7'],
      name: 'Natural Science - Grade 7',
      baseId: 'Laos_Schools_Natural_Science_Textbooks_Student_Ratio_Grade_7',
    },
    {
      numeratorCodes: ['STCL044'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 8'],
      name: 'Natural Science - Grade 8',
      baseId: 'Laos_Schools_Natural_Science_Textbooks_Student_Ratio_Grade_8',
    },
    {
      numeratorCodes: ['STCL063'],
      denominatorCodes: POP_DATA_ELEMENTS['Grade 9'],
      name: 'Natural Science - Grade 9',
      baseId: 'Laos_Schools_Natural_Science_Textbooks_Student_Ratio_Grade_9',
    },

    // Upper secondary
    // (Only Average)
    {
      numeratorCodes: ['STCL080', 'STCL096', 'STCL112'],
      denominatorCodes: POP_DATA_ELEMENTS['Upper Sec'],
      name: 'Lao Language & Literature - Average upper secondary',
      baseId: 'Laos_Schools_Lao_Language_Textbooks_Student_Ratio_Upper_Secondary',
    },
    {
      numeratorCodes: ['STCL081', 'STCL097', 'STCL113'],
      denominatorCodes: POP_DATA_ELEMENTS['Upper Sec'],
      name: 'Mathematics - Average upper secondary',
      baseId: 'Laos_Schools_Mathematics_Textbooks_Student_Ratio_Upper_Secondary',
    },
  ],
};

const mapToLevel = (overlays, level) =>
  overlays.map(overlayConfig => ({
    ...overlayConfig,
    measureLevel: level,
    id: `${overlayConfig.baseId}_${level}`,
  }));

const OVERLAYS_IN_HIERARCHY = {
  Laos_Schools_Textbook_student_Ratio_Group: {
    Laos_Schools_Textbook_student_Ratio_School_Level_Group: {
      Laos_Schools_Textbook_student_Ratio_School_Level_Primary_Group: [], // existing
      Laos_Schools_Textbook_student_Ratio_School_Level_Secondary_Group: [], // existing
    },
    Laos_Schools_Textbook_student_Ratio_District_Level_Group: {
      Laos_Schools_Textbook_student_Ratio_District_Level_Primary_Group: mapToLevel(
        OVERLAY_CONFIG.primary,
        'SubDistrict',
      ),
      Laos_Schools_Textbook_student_Ratio_District_Level_Secondary_Group: mapToLevel(
        OVERLAY_CONFIG.secondary,
        'SubDistrict',
      ),
    },
    Laos_Schools_Textbook_student_Ratio_Province_Level_Group: {
      Laos_Schools_Textbook_student_Ratio_Province_Level_Primary_Group: mapToLevel(
        OVERLAY_CONFIG.primary,
        'District',
      ),
      Laos_Schools_Textbook_student_Ratio_Province_Level_Secondary_Group: mapToLevel(
        OVERLAY_CONFIG.secondary,
        'District',
      ),
    },
  },
};

const GROUP_CODE_TO_NAME = {
  Laos_Schools_Textbook_student_Ratio_Group: 'Textbook-Student Ratio',
  Laos_Schools_Textbook_student_Ratio_School_Level_Group: 'School Level',
  Laos_Schools_Textbook_student_Ratio_School_Level_Primary_Group: 'Primary',
  Laos_Schools_Textbook_student_Ratio_School_Level_Secondary_Group: 'Secondary',
  Laos_Schools_Textbook_student_Ratio_District_Level_Group: 'District Level',
  Laos_Schools_Textbook_student_Ratio_District_Level_Primary_Group: 'Primary',
  Laos_Schools_Textbook_student_Ratio_District_Level_Secondary_Group: 'Secondary',
  Laos_Schools_Textbook_student_Ratio_Province_Level_Group: 'Provincial Level',
  Laos_Schools_Textbook_student_Ratio_Province_Level_Primary_Group: 'Primary',
  Laos_Schools_Textbook_student_Ratio_Province_Level_Secondary_Group: 'Secondary',
};

const FRONTEND_AGGREGATION_LEVEL_TO_BACKEND = {
  District: 'district',
  SubDistrict: 'sub_district',
};

const BASE_MEASURE_BUILDER_CONFIG = {
  dataSourceType: 'custom',
  measureBuilders: {
    numerator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        // dataElementCodes: DYNAMIC,
        requireDataForAllElements: true,
        entityAggregation: {
          dataSourceEntityType: 'school',
          aggregationType: 'SUM_PER_ORG_GROUP',
          // First get the most recent value per school, then sum to the required level.
          entityAggregationOrder: 'AFTER',
          // aggregationEntityType: DYNAMIC,
        },
      },
    },
    denominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        // dataElementCodes: DYNAMIC,
        requireDataForAllElements: true,
        entityAggregation: {
          dataSourceEntityType: 'school',
          aggregationType: 'SUM_PER_ORG_GROUP',
          // First get the most recent value per school, then sum to the required level.
          entityAggregationOrder: 'AFTER',
          // aggregationEntityType: DYNAMIC,
        },
      },
    },
  },
};

const PRESENTATION_OPTIONS = {
  displayType: 'shaded-spectrum',
  scaleType: 'neutral',
  valueType: 'default',
  hideByDefault: {
    null: true,
  },
  scaleBounds: {
    left: {
      max: 0,
      min: 0,
    },
    right: {
      max: 2,
      min: 2,
    },
  },
  // measureLevel: DYNAMIC,
};

const BASE_OVERLAY = {
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'composePercentagePerOrgUnit',
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_schools"}',
};

const insertOverlay = async (db, overlay, index, parentId) => {
  const { id, name, numeratorCodes, denominatorCodes, measureLevel } = overlay;
  const measureBuilderConfig = BASE_MEASURE_BUILDER_CONFIG;

  measureBuilderConfig.measureBuilders.numerator.measureBuilderConfig.dataElementCodes = numeratorCodes;
  measureBuilderConfig.measureBuilders.denominator.measureBuilderConfig.entityAggregation.aggregationEntityType =
    FRONTEND_AGGREGATION_LEVEL_TO_BACKEND[measureLevel];

  measureBuilderConfig.measureBuilders.denominator.measureBuilderConfig.dataElementCodes = denominatorCodes;
  measureBuilderConfig.measureBuilders.numerator.measureBuilderConfig.entityAggregation.aggregationEntityType =
    FRONTEND_AGGREGATION_LEVEL_TO_BACKEND[measureLevel];

  const newOverlay = {
    ...BASE_OVERLAY,
    id,
    name,
    measureBuilderConfig,
    presentationOptions: {
      ...PRESENTATION_OPTIONS,
      measureLevel,
    },
    sortOrder: index,
  };
  await insertObject(db, 'mapOverlay', newOverlay);
  await insertOverlayRelation(db, id, parentId, 'mapOverlay');
};

const OLD_OVERLAY_GROUPS_TO_NEW_MAP = {
  Laos_Schools_Textbook_student_Ratio_Primary_Group:
    'Laos_Schools_Textbook_student_Ratio_School_Level_Primary_Group',
  Laos_Schools_Textbook_student_Ratio_Secondary_Group:
    'Laos_Schools_Textbook_student_Ratio_School_Level_Secondary_Group',
};

const overlayGroupIdFromCode = async (db, code) =>
  ((await db.runSql(`select id from map_overlay_group where code = '${code}';`)).rows[0] || {}).id;

// Before up, delete conflicting old overlay group
const beforeUp = async db => {
  const overlayGroupCode = 'Laos_Schools_Textbook_student_Ratio_Group';
  const overlayGroupId = await overlayGroupIdFromCode(db, overlayGroupCode);
  await db.runSql(`
    delete from map_overlay_group_relation
    where map_overlay_group_id = '${overlayGroupId}';
  `);
  await db.runSql(`
    delete from map_overlay_group
    where id = '${overlayGroupId}';
  `);
};

const afterUp = async db => {
  // For each overlayGroup which needs migration,
  // - Change all the map_overlay_group_relation entries to point to the new group
  // - Delete the old groups
  await Promise.all(
    Object.entries(OLD_OVERLAY_GROUPS_TO_NEW_MAP).map(async ([oldCode, newCode]) => {
      const newId = await overlayGroupIdFromCode(db, newCode);
      const oldId = await overlayGroupIdFromCode(db, oldCode);

      return db.runSql(`
        update map_overlay_group_relation
        set map_overlay_group_id = '${newId}'
        where map_overlay_group_id = '${oldId}';

        delete from map_overlay_group
        where id = '${oldId}';
      `);
    }),
  );
};

const OLD_OVERLAY_GROUPS = {
  parent: {
    id: generateId(),
    name: 'Textbook-Student Ratio',
    code: 'Laos_Schools_Textbook_student_Ratio_Group',
  },
  primary: {
    id: generateId(),
    name: 'Primary Textbook-Student Ratio',
    code: 'Laos_Schools_Textbook_student_Ratio_Primary_Group',
  },
  secondary: {
    id: generateId(),
    name: 'Secondary Textbook-Student Ratio',
    code: 'Laos_Schools_Textbook_student_Ratio_Secondary_Group',
  },
};

const beforeDown = async db => {
  insertObject(db, 'map_overlay_group', OLD_OVERLAY_GROUPS.primary);
  insertObject(db, 'map_overlay_group', OLD_OVERLAY_GROUPS.secondary);

  await Promise.all(
    Object.entries(OLD_OVERLAY_GROUPS_TO_NEW_MAP).map(async ([oldCode, newCode]) => {
      return db.runSql(`
        update map_overlay_group_relation
        set map_overlay_group_id = '${await overlayGroupIdFromCode(db, oldCode)}'
        where map_overlay_group_id = '${await overlayGroupIdFromCode(db, newCode)}';
      `);
    }),
  );
};

const afterDown = async db => {
  insertObject(db, 'map_overlay_group', OLD_OVERLAY_GROUPS.parent);
  insertOverlayRelation(
    db,
    OLD_OVERLAY_GROUPS.primary.id,
    OLD_OVERLAY_GROUPS.parent.id,
    'mapOverlayGroup',
  );
  insertOverlayRelation(
    db,
    OLD_OVERLAY_GROUPS.secondary.id,
    OLD_OVERLAY_GROUPS.parent.id,
    'mapOverlayGroup',
  );
};

/**
 * Shouldn't have to touch code below here
 * IF all the groups and overlays that are being added are new
 * ---------------------------------------
 */

const insertOverlayRelation = (db, childId, parentId, childType) => {
  const relationId = generateId();
  return insertObject(db, 'map_overlay_group_relation', {
    id: relationId,
    map_overlay_group_id: parentId,
    child_id: childId,
    child_type: childType,
  });
};

const insertOverlayGroup = async (db, group, parentId) => {
  const existingGroups = (await db.runSql(`select * from "map_overlay_group"`)).rows;
  if (existingGroups.some(({ code }) => code === group.code)) {
    // Because the down migration doesn't handle it, this function shouldn't
    throw new Error('Duplicate overlay group code!');
  }

  const groupId = generateId();
  await insertObject(db, 'map_overlay_group', { ...group, id: groupId });

  if (parentId) await insertOverlayRelation(db, groupId, parentId, 'mapOverlayGroup');

  return groupId;
};

const insertGroupAndChildren = async (db, groupCode, children, parentId = null) => {
  const group = {
    code: groupCode,
    name: GROUP_CODE_TO_NAME[groupCode],
  };
  const groupId = await insertOverlayGroup(db, group, parentId);

  if (Array.isArray(children)) {
    // Children are map overlays. Base case
    return Promise.all(
      children.map((overlay, index) => insertOverlay(db, overlay, index, groupId)),
    );
  }
  // Children are map overlay groups. Recurse.
  return Promise.all(
    Object.entries(children).map(([newGroup, newChildren]) =>
      insertGroupAndChildren(db, newGroup, newChildren, groupId),
    ),
  );
};

exports.up = async function (db) {
  await beforeUp(db);
  await Promise.all(
    Object.entries(OVERLAYS_IN_HIERARCHY).map(([groupCode, children]) =>
      insertGroupAndChildren(db, groupCode, children),
    ),
  );
  await afterUp(db);
};

const deleteGroupAndChildren = async (db, groupCode, children) => {
  const groupResponse = await db.runSql(
    `select id from "map_overlay_group" where code='${groupCode}';`,
  );
  const groupId = groupResponse.rows[0].id;
  await db.runSql(
    `delete from "map_overlay_group_relation" where map_overlay_group_id='${groupId}';`,
  );
  await db.runSql(`delete from "map_overlay_group_relation" where child_id='${groupId}';`);

  // The group needs to be deleted after the relation to avoid foreign key constraint violations
  await db.runSql(`delete from "map_overlay_group" where code='${groupCode}';`);

  if (Array.isArray(children)) {
    // Children are map overlays. Base case
    return Promise.all(
      children.map(overlay => db.runSql(`delete from "mapOverlay" where id='${overlay.id}'`)),
    );
  }

  // Children are map overlay groups. Recurse.
  return Promise.all(
    Object.entries(children).map(([newGroup, newChildren]) =>
      deleteGroupAndChildren(db, newGroup, newChildren),
    ),
  );
};

exports.down = async function (db) {
  await beforeDown(db);
  await Promise.all(
    Object.entries(OVERLAYS_IN_HIERARCHY).map(([groupCode, children]) =>
      deleteGroupAndChildren(db, groupCode, children),
    ),
  );
  await afterDown(db);
};

exports._meta = {
  version: 1,
};
