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

const UnfpaMonthlyFiveMethods = [
  'UNFPA_Monthly_5_Methods_of_Contraception_Regional',
  'UNFPA_Monthly_5_Methods_of_Contraception',
];
const UnfpaMonthlyThreeMethods = [
  'UNFPA_Monthly_3_Methods_of_Contraception_Regional',
  'UNFPA_Monthly_3_Methods_of_Contraception',
];

exports.up = async function (db) {
  await db.runSql(`
    update "legacy_report" lr
    set "data_builder_config" = regexp_replace(lr."data_builder_config"::text, '=','like','g')::jsonb
    where code in (${arrayToDbString(UnfpaMonthlyFiveMethods)})
`);

  await db.runSql(`
    update "legacy_report" lr
    set "data_builder_config" = regexp_replace(lr."data_builder_config"::text, '<>','not like','g')::jsonb
    where code in (${arrayToDbString(UnfpaMonthlyThreeMethods)})
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
