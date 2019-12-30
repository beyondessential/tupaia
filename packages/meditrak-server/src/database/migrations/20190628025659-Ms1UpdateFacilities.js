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

exports.up = async function(db) {
  // mapping with clinics in Kiribati between MS1 and Tuapaia
  const MS1_API_CLINICS = {
    KI_CRD68: { name: 'London Dispensary', distributionId: '2105' },
    KI_KHPHAR: { name: 'London Hospital', distributionId: '2101' },
    KI_NRD43: { name: 'Taboiaki', distributionId: null },
    KI_RHC01: { name: 'Mwakin HC', distributionId: '1306' },
    KI_MRHC06: { name: 'Maiana HC', distributionId: '907' },
    KI_ABRD21: { name: 'Tanimaiaki', distributionId: '408' },
    KI_ABRD14: { name: 'Toonga', distributionId: '405' },
    KI_BEUC08: { name: 'Temakin clinic', distributionId: '703' },
  };
  await Promise.all(
    Object.keys(MS1_API_CLINICS).map(key => {
      const value = MS1_API_CLINICS[key];
      if (!value.distributionId) {
        return db.runSql(`
        UPDATE entity SET metadata = metadata::jsonb - 'ms1DistributionId'
          WHERE code = '${key}';
      `);
      }
      return db.runSql(`
        UPDATE entity SET metadata = '{"ms1DistributionId": "${value.distributionId}"}'
          WHERE code = '${key}';
      `);
    }),
  );
  return null;
};


exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
