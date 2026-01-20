'use strict';

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

const LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Schools_Used_As_Quarantine',
    newName: 'Currently used as quarantine centre',
    oldName: 'Schools used as quarantine centres',
  },
  {
    id: 'Laos_Schools_Internet_Connection_Available_In_School',
    newName: 'Internet connection available',
    oldName: 'Internet connection available in school',
  },
  {
    id: 'Laos_Schools_Electricity_Available',
    newName: 'Electricity available',
    oldName: 'Electricity available in school change',
  },
  {
    id: 'Laos_Schools_Functioning_Toilet',
    newName: 'Functioning toilets',
    oldName: 'Functioning toilet (vs. unusable)',
  },
  {
    id: 'Laos_Schools_Schools_Implementing_Remedial_Education_Programmes',
    newName: 'Remedial support provided to students',
    oldName: 'Schools implementing remedial education programmes',
  },
];

exports.up = async function (db) {
  await Promise.all(
    LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS.map(overlay => {
      const { id, newName } = overlay;
      return db.runSql(`
        UPDATE "mapOverlay"
        SET name = '${newName}'
        WHERE id = '${id}';
      `);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS.map(overlay => {
      const { id, oldName } = overlay;
      return db.runSql(`
        UPDATE "mapOverlay"
        SET name = '${oldName}'
        WHERE id = '${id}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
