import { arrayToDbString } from '../utilities';

('use strict');

var dbm;
var type;
var seed;

const DEMO_LAND_COUNTRY_ID = '59085f2dfc6a0715dae508f0';

const SURVEY_IDS = [
  '5a7bda323ec0d460d2173e05',
  '5b67d770f013d64e811e4a25',
  '5bea415ef013d6491a1d6a57',
  '5d524403f013d61a6219e0ed',
  '5d52442df013d61a6223f229',
  '5a7bda203ec0d460d2358cd8',
  '5c79ef94f013d67ad5970c2e',
  '5c79ef97f013d67ad529dcb4',
  '5c79ef97f013d67ad5348404',
  '5c79ef97f013d67ad51a3736',
  '5c79ef96f013d67ad53691f7',
  '5c79ef96f013d67ad51e1cef',
  '5c79ef96f013d67ad54be2f9',
  '5c79ef96f013d67ad59fb7c7',
  '5cd11e13f013d605a4125aaf',
  '5cd11e13f013d605a432712a',
  '5cd11e13f013d605a435c3f9',
  '5cd11e13f013d605a43a5370',
  '5cd11e13f013d605a41015c7',
  '5cd11e13f013d605a4345f6b',
  '5cd11e0cf013d605a4151388',
  '5cd11e0df013d605a436a2a5',
  '5cd11e0ef013d605a4eaf70b',
  '5cd11e0ef013d605a4241deb',
  '5cd11e0ef013d605a431bfbe',
  '5cd11e10f013d605a423b827',
  '5cd11e10f013d605a42cd806',
  '5cd11e12f013d605a432b677',
  '5cd11e12f013d605a48519a5',
  '5b889d7df013d654c4104d35',
  '5b889d7ef013d654c45b2344',
  '5b889d7ef013d654c48992cf',
  '5b889eddf013d654c4244a9f',
  '5b889eddf013d654c4287fac',
  '5b889eddf013d654c42c6ebf',
  '5b889eddf013d654c433d092',
  '5b889eddf013d654c437f12b',
  '5b889eddf013d654c4199271',
  '5b889eddf013d654c4d1b0f4',
  '5b889eddf013d654c414595a',
  '5b88a0e0f013d654c43a93e3',
  '5b88a0e0f013d654c48d541e',
  '5b88a0e0f013d654c4e3b440',
  '5b88a0e0f013d654c4166e1e',
  '5b88a0e0f013d654c41f8d02',
  '5b88a0e1f013d654c4acf86b',
  '5b88a0e1f013d654c476c376',
  '5b88c76af013d654c4fca54e',
  '5b88a20cf013d654c4299bb6',
  '5b88a20cf013d654c42d848c',
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
  await db.runSql(`
    UPDATE survey
    SET country_ids = array_remove(country_ids, '${DEMO_LAND_COUNTRY_ID}')
    WHERE id IN (${arrayToDbString(SURVEY_IDS)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE survey
    SET country_ids = country_ids || '{${DEMO_LAND_COUNTRY_ID}}'
    WHERE id IN (${arrayToDbString(SURVEY_IDS)});
  `);
};

exports._meta = {
  version: 1,
};
