'use strict';

import { arrayToDbString } from '../utilities';

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

const dengueNoWarningCase = { Dengue_Fever_Without_Warning_Signs_Case: 'Dengue_no_warning_case' };
const dengueWithWarningCase = { Dengue_Fever_With_Warning_Signs_Case: 'Dengue_with_warning_case' };
const dengueSevereCase = { Severe_Dengue_Case: 'Dengue_severe_case' };
const dengueNoWarningDeath = {
  Dengue_Fever_Without_Warning_Signs_Death: 'Dengue_no_warning_death',
};
const dengueWithWarningDeath = {
  Dengue_Fever_With_Warning_Signs_Death: 'Dengue_with_warning_death',
};
const dengueSevereDeath = { Severe_Dengue_Death: 'Dengue_severe_death' };
const malariaCase = { Total_Positive_Malaria_Cases: 'Malaria_case' };
const malariaDeath = { Total_Malaria_Deaths: 'Malaria_death' };
const measlesCase = { Total_Positive_Measles_Cases: 'Measles_case' };
const measlesDeath = { Total_Measles_Deaths: 'Measles_death' };

const DATA_SOURCES = {
  ...dengueNoWarningCase,
  ...dengueWithWarningCase,
  ...dengueSevereCase,
  ...dengueNoWarningDeath,
  ...dengueWithWarningDeath,
  ...dengueSevereDeath,
  ...malariaCase,
  ...malariaDeath,
  ...measlesCase,
  ...measlesDeath,
};
const MAP_OVERLAYS_CHANGES_IN_BUILDER_CONFIG = [
  {
    ids: [
      'LAOS_EOC_Total_Dengue_Cases_By_Sub_District',
      'LAOS_EOC_Total_Dengue_Cases_By_Facility',
      'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility',
      'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Total',
      'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Other',
      'LAOS_EOC_Total_Dengue_Cases_Severe_V_Other_By_Facility_Severe',
    ],
    renameMapping: {
      ...dengueNoWarningCase,
      ...dengueWithWarningCase,
      ...dengueSevereCase,
    },
  },
  {
    ids: [
      'LAOS_EOC_Total_Dengue_Deaths_By_Sub_District',
      'LAOS_EOC_Total_Dengue_Deaths_By_Facility',
    ],
    renameMapping: {
      ...dengueNoWarningDeath,
      ...dengueWithWarningDeath,
      ...dengueSevereDeath,
    },
  },
];
const MAP_OVERLAYS_CHANGES_IN_DATA_ELEMENT_CODE = [
  {
    ids: [
      'LAOS_EOC_Total_Malaria_Cases_By_Sub_District',
      'LAOS_EOC_Total_Malaria_Cases_By_Facility',
    ],
    renameMapping: {
      ...malariaCase,
    },
  },
  {
    ids: [
      'LAOS_EOC_Total_Malaria_Deaths_By_Sub_District',
      'LAOS_EOC_Total_Malaria_Deaths_By_Facility',
    ],
    renameMapping: {
      ...malariaDeath,
    },
  },
  {
    ids: [
      'LAOS_EOC_Total_Measles_Deaths_By_Sub_District',
      'LAOS_EOC_Total_Measles_Deaths_By_Facility',
    ],
    renameMapping: {
      ...measlesDeath,
    },
  },
  {
    ids: [
      'LAOS_EOC_Total_Measles_Cases_By_Sub_District',
      'LAOS_EOC_Total_Measles_Cases_By_Facility',
    ],
    renameMapping: {
      ...measlesCase,
    },
  },
];

exports.up = async function (db) {
  for (const [originalCode, correctCode] of Object.entries(DATA_SOURCES)) {
    await db.runSql(`
      UPDATE "data_source"
      SET code = '${correctCode}'
      WHERE code = '${originalCode}'
    `);
  }

  for (const { ids, renameMapping } of MAP_OVERLAYS_CHANGES_IN_BUILDER_CONFIG) {
    const idInArray = arrayToDbString(ids);
    for (const [originalCode, correctCode] of Object.entries(renameMapping)) {
      await db.runSql(`
        update "mapOverlay" mo
        set "measureBuilderConfig" = regexp_replace(mo."measureBuilderConfig"::text, '${originalCode}','${correctCode}','g')::jsonb
        where id in (${idInArray})
      `);
    }
  }

  for (const { ids, renameMapping } of MAP_OVERLAYS_CHANGES_IN_DATA_ELEMENT_CODE) {
    const idInArray = arrayToDbString(ids);
    for (const correctCode of Object.values(renameMapping)) {
      await db.runSql(`
        update "mapOverlay" dr
        set "dataElementCode" = '${correctCode}'
        where id in (${idInArray})
      `);
    }
  }
};

exports.down = async function (db) {
  for (const [originalCode, correctCode] of Object.entries(DATA_SOURCES)) {
    await db.runSql(`
      UPDATE "data_source"
      SET code = '${originalCode}'
      WHERE code = '${correctCode}'
    `);
  }
  for (const { ids, renameMapping } of MAP_OVERLAYS_CHANGES_IN_BUILDER_CONFIG) {
    const idInArray = arrayToDbString(ids);
    for (const [originalCode, correctCode] of Object.entries(renameMapping)) {
      await db.runSql(`
        update "mapOverlay" dr
        set "measureBuilderConfig" = regexp_replace(dr."measureBuilderConfig"::text, '${correctCode}','${originalCode}','g')::jsonb
        where id in (${idInArray})
      `);
    }
  }
  for (const { ids, renameMapping } of MAP_OVERLAYS_CHANGES_IN_DATA_ELEMENT_CODE) {
    const idInArray = arrayToDbString(ids);
    for (const originalCode of Object.keys(renameMapping)) {
      await db.runSql(`
        update "mapOverlay" dr
        set "dataElementCode" = '${originalCode}'
        where id in (${idInArray})
      `);
    }
  }
};

exports._meta = {
  version: 1,
};
