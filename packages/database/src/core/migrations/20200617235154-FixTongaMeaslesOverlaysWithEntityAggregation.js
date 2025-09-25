import { arrayToDbString } from '../utilities';

('use strict');

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

const IDS = [
  'CD_Measles_New_Cases_10kPax_Age_In_5_24',
  'CD_Measles_New_Cases_10kPax_Age_Gte_25',
  'CD_Measles_New_Cases_10kPax_Age_Lt_5',
];

const ENTITY_AGGREGATION = {
  aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
  dataSourceEntityType: 'village',
  aggregationEntityType: 'facility',
};

exports.up = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{measureBuilders,numerator,measureBuilderConfig,entityAggregation}', '${JSON.stringify(
      ENTITY_AGGREGATION,
    )}')
    where id in (${arrayToDbString(IDS)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = "measureBuilderConfig" #- '{measureBuilders,numerator,measureBuilderConfig,entityAggregation}'
    where id in (${arrayToDbString(IDS)});
  `);
};

exports._meta = {
  version: 1,
};
