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

const OVERLAY_IDS = [
  'AU_FLUTRACKING_Participants_Per_100k',
  'AU_FLUTRACKING_Fever_And_Cough',
  'AU_FLUTRACKING_Fever_And_Cough_Causing_Absence',
  'AU_FLUTRACKING_Vaccination_Rate_Flu',
  'AU_FLUTRACKING_Vaccinated_With_Fever_And_Cough',
  'AU_FLUTRACKING_Sought_Medical_Advice',
  'AU_FLUTRACKING_Tested_For_Flu',
  'AU_FLUTRACKING_Tested_For_Covid',
  'AU_FLUTRACKING_Tested_Positive_For_Flu',
  'AU_FLUTRACKING_Tested_Positive_For_Covid',
  'AU_FLUTRACKING_LGA_Fever_And_Cough',
  'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence',
  'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
  'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
  'AU_FLUTRACKING_LGA_Sought_Medical_Advice',
  'AU_FLUTRACKING_LGA_Tested_For_Flu',
  'AU_FLUTRACKING_LGA_Tested_For_Covid',
  'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
  'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
];

const PROJECT_CODES = ['explore', 'covidau'];

exports.up = async function (db) {
  await Promise.all(
    OVERLAY_IDS.map(id =>
      db.runSql(`
        UPDATE "mapOverlay"
        SET "projectCodes" = '{${PROJECT_CODES.map(p => `"${p}"`).join(',')}}'
        WHERE "id" = '${id}';
      `),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    OVERLAY_IDS.map(id =>
      db.runSql(`
        UPDATE "mapOverlay"
        SET "projectCodes" = '{${PROJECT_CODES.map(p => `"${p}"`).join(',')}}'
        WHERE "id" = '${id}';
      `),
    ),
  );
};

exports._meta = {
  version: 1,
};
