'use strict';

var dbm;
var type;
var seed;

import { arrayToDbString } from '../utilities';

const DEMO_LAND_CODE = 'DL';

const getDemoLandCountryId = async db => db.runSql(`SELECT id FROM country WHERE code = '${DEMO_LAND_CODE}' LIMIT 1;`);

const SURVEY_CODES = [
  'AFF',
  'AI',
  'AII',
  'ALS',
  'ALSM',
  'AS',
  'CH1',
  'CH2a',
  'CH2b',
  'CH3',
  'CH4',
  'CH10',
  'CH11',
  'CH12',
  'DP_LEGACY',
  'DR_LEGACY',
  'DWSSP_A1',
  'DWSSP_A2A',
  'DWSSP_A2B',
  'DWSSP_A2C',
  'DWSSP_A2D',
  'DWSSP_A2E',
  'DWSSP_CD',
  'DWSSP_S1',
  'DWSSP_S2',
  'DWSSP_S3A',
  'DWSSP_S3B',
  'DWSSP_S3C',
  'DWSSP_S4',
  'DWSSP_S5',
  'DWSSP_S6',
  'FP02',
  'FP03',
  'FP04',
  'IMMS01',
  'IMMS02',
  'IMMS03',
  'IMMS04',
  'IMMS05',
  'IMMS06',
  'IMMS07',
  'IMMS08',
  'MCH01',
  'MCH02',
  'MCH03',
  'MCH04',
  'MCH05',
  'MCH07',
  'MCH08',
  'POP01',
  'POP02',
  'POP03'
];

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  const demolandCountryId = (await getDemoLandCountryId(db)).rows[0].id;

  await db.runSql(`
    UPDATE survey
    SET country_ids = array_remove(country_ids, '${demolandCountryId}')
    WHERE code IN (${arrayToDbString(SURVEY_CODES)});
  `);

  console.log(`${demolandCountryId}`)
};

exports.down = async function (db) {
  const demolandCountryId = (await getDemoLandCountryId(db)).rows[0].id;

  await db.runSql(`
    UPDATE survey
    SET country_ids = country_ids || '{${demolandCountryId}}'
    WHERE code IN (${arrayToDbString(SURVEY_CODES)});
  `);
};

exports._meta = {
  "version": 1
};
