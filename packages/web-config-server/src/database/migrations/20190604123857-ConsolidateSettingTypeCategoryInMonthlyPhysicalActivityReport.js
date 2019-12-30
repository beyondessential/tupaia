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
  // First copy the wrongly named field to a correct field,
  // and then delete the wrong field
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set
          (
            "dataBuilderConfig",
            '{columns, HP4}',
            '{
              "title" : "Setting Type Category",
              "additionalData" : [
                "HP5",
                "HP6",
                "HP7"
              ]
            }',
            true
          )
        #- '{columns, HP5}' #- '{columns, HP6}' #- '{columns, HP7}'
    WHERE
      id = 'TO_HPU_Validation_HP_01';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
