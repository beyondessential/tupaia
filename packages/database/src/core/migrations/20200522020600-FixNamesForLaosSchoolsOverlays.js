'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const CHANGES_TO_MAKE_BY_OVERLAY = {
  Laos_Schools_Electricity_Province: {
    name: 'Electricity available in school',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Internet_Province: {
    name: 'Internet connection available in school',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Water_Supply_Province: {
    name: 'Functioning water supply',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Toilet_Province: {
    name: 'Functioning toilet (vs. unusable)',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Hand_Washing_Province: {
    name: 'Hand washing facility available',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Hard_Copy_Materials_Province: {
    name:
      'Schools that received (hard copies of) learning materials for (remote) communities with limited internet and TV access',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Cleaning_Materials_Province: {
    name:
      'Schools provided with cleaning/disinfecting materials and guidance provided on their use',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Hygiene_Kits_Province: {
    name: 'Schools provided with hygiene kids',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_COVID_Training_Province: {
    name: 'Schools received training on safe school protocols (COVID-19 prevention and control)',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Remedial_Education_Province: {
    name: 'Schools implementing remedial education programmes',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
  Laos_Schools_Psychosocial_Support_Province: {
    name: 'Schools provided with psychosocial support',
    groupName: 'School Utility/Resource Availability at the Province Level',
  },
};

const REVERSE_CHANGES_TO_MAKE_BY_OVERLAY = {
  Laos_Schools_Electricity_Province: {
    name: 'Electricity',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Internet_Province: {
    name: 'Internet connection in school',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Water_Supply_Province: {
    name: 'Functioning water supply',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Toilet_Province: {
    name: 'Functioning toilet',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Hand_Washing_Province: {
    name: 'Hand washing facilities',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Hard_Copy_Materials_Province: {
    name: 'Hard copy learning materials for communities with limited internet and TV access',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Cleaning_Materials_Province: {
    name: 'Cleaning/disinfecting materials and guidance on their use',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Hygiene_Kits_Province: {
    name: 'Hygiene kits',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_COVID_Training_Province: {
    name: 'COVID-19 prevention and control training',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Remedial_Education_Province: {
    name: 'Implementing remedial education programmes',
    groupName: '% of schools in province with access to resource',
  },
  Laos_Schools_Psychosocial_Support_Province: {
    name: 'Psychosocial support',
    groupName: '% of schools in province with access to resource',
  },
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return Promise.all(
    Object.entries(CHANGES_TO_MAKE_BY_OVERLAY).map(([overlayId, changes]) =>
      Promise.all(
        Object.entries(changes).map(([columnName, newValue]) =>
          db.runSql(`
            update "mapOverlay"
            set "${columnName}" = '${newValue}'
            where id='${overlayId}';
          `),
        ),
      ),
    ),
  );
};

exports.down = function (db) {
  return Promise.all(
    Object.entries(REVERSE_CHANGES_TO_MAKE_BY_OVERLAY).map(([overlayId, changes]) =>
      Promise.all(
        Object.entries(changes).map(([columnName, newValue]) =>
          db.runSql(`
            update "mapOverlay"
            set "${columnName}" ='${newValue}'
            where id='${overlayId}';
          `),
        ),
      ),
    ),
  );
};

exports._meta = {
  version: 1,
};
