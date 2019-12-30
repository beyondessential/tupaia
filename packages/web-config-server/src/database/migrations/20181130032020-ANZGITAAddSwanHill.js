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

exports.up = function(db) {
  const rejectOnError = (resolve, reject, error) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  };
  return new Promise((resolve, reject) =>
    db.insert(
      'dashboardGroup',
      [
        'code',
        'organisationLevel',
        'userGroup',
        'organisationUnitCode',
        'name',
        'dashboardReports',
      ],
      [
        'SwanHill_ANZGITA_Facility',
        'Facility',
        'Royal Australasian College of Surgeons',
        'DL_3',
        'ANZGITA',
        '{ANZGITA_Inventory}',
      ],
      error => rejectOnError(resolve, reject, error),
    ),
  );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
