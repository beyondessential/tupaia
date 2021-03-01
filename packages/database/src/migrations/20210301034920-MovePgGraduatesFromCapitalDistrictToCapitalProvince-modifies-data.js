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

const capitalProvinceCode = 'PG_National Capital District';
const capitalDistrictCode = 'PG_National Capital District_NCD';

const revertIndividualCodes = ['FETP_iRLul81', 'FETP_iCAqu76'];

exports.up = async function (db) {
  const provinceId = (
    await db.runSql(`select id from entity where code = '${capitalProvinceCode}'`)
  ).rows[0].id;

  return db.runSql(`
    update entity set parent_id = '${provinceId}' where parent_id in (select id from entity where code = '${capitalDistrictCode}');
  `);
};

exports.down = async function (db) {
  const districtId = (
    await db.runSql(`select id from entity where code = '${capitalDistrictCode}'`)
  ).rows[0].id;

  return db.runSql(`
    update entity 
    set parent_id = '${districtId}' 
    where code in (${arrayToDbString(revertIndividualCodes)});
  `);;
};

exports._meta = {
  version: 1,
};
