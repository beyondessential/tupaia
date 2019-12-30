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
    KI_BTRD06: { name: 'Tanimaiaki', distributionId: '0208' },
    KI_NKRD65: { name: 'Nikumatang', distributionId: '1804' },
    KI_BTRD04: { name: 'Kuma', distributionId: '0202' },
    KI_CRD68: { name: 'London', distributionId: '2101' },
    KI_ARHC17: { name: 'Arorae HC', distributionId: '2002' },
  };
  await Promise.all(
    Object.keys(MS1_API_CLINICS).map(key => {
      const value = MS1_API_CLINICS[key];
      if (!value.distributionId) return true;
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
  version: 1,
};
