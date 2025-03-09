'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const CHANGES_TO_MAKE_BY_OVERLAY = {
  Laos_Schools_Children_Supported_With_Learning_Materials: {
    name:
      'Number of children supported with learning materials made available on MoES website in their lessons',
    groupName: 'Number of Students',
  },
  Laos_Schools_Children_Supported_With_TV_Programmes_Radio: {
    groupName: 'Number of Students',
  },
  Laos_Schools_Children_Provided_Psychosocial_Support: {
    groupName: 'Number of Students',
  },
  Laos_Schools_School_Type: {
    name: 'School type',
  },
  Laos_Schools_Dormitory_Schools: {
    name: 'Dormitory schools',
  },
  LAOS_SCHOOLS_Total_Students: {
    name: 'Total students',
    groupName: 'Number of Students',
    id: 'Laos_Schools_Total_Students', // Important that the ids are last
  },
  LAOS_SCHOOLS_Female_Students: {
    name: 'Female students',
    groupName: 'Number of Students',
    id: 'Laos_Schools_Female_Students',
  },
  LAOS_SCHOOLS_Male_Students: {
    name: 'Male students',
    groupName: 'Number of Students',
    id: 'Laos_Schools_Male_Students',
  },
};

const REVERSE_CHANGES_TO_MAKE_BY_OVERLAY = {
  Laos_Schools_Children_Supported_With_Learning_Materials: {
    name:
      'Number of children supported with Learning materials made available on MoES website in their lessons',
    groupName: 'Number of Children',
  },
  Laos_Schools_Children_Supported_With_TV_Programmes_Radio: {
    groupName: 'Number of Children',
  },
  Laos_Schools_Children_Provided_Psychosocial_Support: {
    groupName: 'Number of Children',
  },
  Laos_Schools_School_Type: {
    name: 'School Type',
  },
  Laos_Schools_Dormitory_Schools: {
    name: 'Dormitory Schools',
  },
  Laos_Schools_Total_Students: {
    name: 'Total Students',
    groupName: 'Number of students',
    id: 'LAOS_SCHOOLS_Total_Students',
  },
  Laos_Schools_Female_Students: {
    name: 'Female Students',
    groupName: 'Number of students',
    id: 'LAOS_SCHOOLS_Female_Students',
  },
  Laos_Schools_Male_Students: {
    name: 'Male Students',
    groupName: 'Number of students',
    id: 'LAOS_SCHOOLS_Male_Students',
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
