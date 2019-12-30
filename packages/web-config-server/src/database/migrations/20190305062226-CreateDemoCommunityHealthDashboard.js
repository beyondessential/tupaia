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
          'DL_Community_Health_Validation',
          'Facility',
          'Tonga Community Health',
          'DL',
          'Community Health Validation',
          '{"TO_CH_Validation_CH1", "TO_CH_Validation_CH1b", "TO_CH_Validation_CH2a", "TO_CH_Validation_CH2b", "TO_CH_Validation_CH3", "TO_CH_Validation_CH5", "TO_CH_Validation_CH6", "TO_CH_Validation_CH7", "TO_CH_Validation_CH8", "TO_CH_Validation_CH9", "TO_CH_Validation_CH10", "TO_CH_Validation_CH12"}',
        ],
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
