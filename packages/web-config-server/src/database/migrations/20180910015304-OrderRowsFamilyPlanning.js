'use strict';

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

exports.up = function(db, callback) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  Promise.all([
    new Promise((resolve, reject) =>
      db.runSql(
        `
      UPDATE "dashboardReport"
      SET "queryJson" = ("queryJson" - 'dataElementGroupCode') || '{"dataElementCodes": [ "MCH3", "MCH4", "MCH5", "MCH6", "MCH7", "MCH8", "MCH9", "MCH10", "MCH11", "MCH12", "MCH13", "MCH14", "MCH2"]}'
      WHERE id = 'TO_RH_Validation_MCH01';
    `,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `
      UPDATE "dashboardReport"
      SET "queryJson" = ("queryJson" - 'dataElementGroupCode') || '{"dataElementCodes": [ "MCH110",  "MCH111",  "MCH112",  "MCH113",  "MCH114",  "MCH115",  "MCH116",  "MCH117",  "MCH118",  "MCH119",  "MCH120"]}'
      WHERE id = 'TO_RH_Validation_MCH07';
    `,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `
      UPDATE "dashboardReport"
      SET "queryJson" = ("queryJson" - 'dataElementGroupCode') || '{"dataElementCodes": [ "IMMS2", "IMMS3", "IMMS4"]}'
      WHERE id = 'TO_RH_Validation_IMMS01';
    `,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `
      UPDATE "dashboardReport"
      SET "queryJson" = ("queryJson" - 'dataElementGroupCode') || '{"dataElementCodes": [ "IMMS11", "IMMS12", "IMMS13", "IMMS14", "IMMS15", "IMMS16", "IMMS17", "IMMS18", "IMMS19", "IMMS20", "IMMS21", "IMMS22"]}'
      WHERE id = 'TO_RH_Validation_IMMS03';
    `,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `
      UPDATE "dashboardReport"
      SET "queryJson" = ("queryJson" - 'dataElementGroupCode') || '{"dataElementCodes": [ "IMMS24", "IMMS25", "IMMS26", "IMMS27", "IMMS28", "IMMS29"]}'
      WHERE id = 'TO_RH_Validation_IMMS04';
    `,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.runSql(
        `
      UPDATE "dashboardReport"
      SET "queryJson" = ("queryJson" - 'dataElementGroupCode') || '{"dataElementCodes": [ "IMMS31", "IMMS32", "IMMS33", "IMMS34", "IMMS35", "IMMS36", "IMMS37", "IMMS38"]}'
      WHERE id = 'TO_RH_Validation_IMMS05';
    `,
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]).then(() => callback());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
