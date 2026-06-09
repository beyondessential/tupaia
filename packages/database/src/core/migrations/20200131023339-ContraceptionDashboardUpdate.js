'use strict';

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

exports.up = function (db) {
  return db.runSql(`
	UPDATE "dashboardReport" 
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"Primary Facilities Offering 3 Methods of Contraception"'), 
    	"dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{filter}', '{"name": "filterFacility", "comparator": "<>"}')
    where id = 'UNFPA_Monthly_3_Methods_of_Contraception';

    UPDATE "dashboardReport" 
    SET "viewJson" = jsonb_set("viewJson", '{name}', '"Secondary Facilities Offering 5 Methods of Contraception"'), 
    	"dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{filter}', '{"name": "filterFacility", "comparator": "="}')
    where id = 'UNFPA_Monthly_5_Methods_of_Contraception';

    `);
};

exports.down = function (db) {
  return db.runSql(`
  UPDATE "dashboardReport" 
  SET "viewJson" = jsonb_set("viewJson", '{name}', '"Facilities Offering 3 Methods of Contraception"') ,
      "dataBuilderConfig" = "dataBuilderConfig" - 'filter'    
  where id = 'UNFPA_Monthly_3_Methods_of_Contraception';

  UPDATE "dashboardReport" 
  SET "viewJson" = jsonb_set("viewJson", '{name}', '"Facilities Offering 5 Methods of Contraception"'),
      "dataBuilderConfig" = "dataBuilderConfig" - 'filter'    
  where id = 'UNFPA_Monthly_5_Methods_of_Contraception';

  `);
};

exports._meta = {
  version: 1,
};
