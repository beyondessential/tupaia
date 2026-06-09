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
    update "dashboardReport"
    
    set "viewJson" = "viewJson" || '{"presentationOptions" : {
      "yellow" : {
        "min" : 6,
        "label" : "",
        "description" : "Months of stock: ",
        "color" : "#fdd835"
      },
      "showRawValue" : true,
      "red" : {
        "min" : 0,
        "label" : "",
        "max" : 0,
        "description" : "Months of stock: ",
        "color" : "#b71c1c"
      },
      "type" : "range",
      "green" : { 
        "min" : 3,
        "label" : "",
        "max" : 6,
        "description" : "Months of stock: ",
        "color" : "#33691e"
      },
      "orange": {
        "min" : 1,
        "label" : "",
        "max" : 2,
        "description" : "Months of stock: ",
        "color": "#EE9A30"
      }
    }}'
    
    where "id" = 'UNFPA_Priority_Medicines_MOS';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardReport"

    set "viewJson" = "viewJson" - 'presentationOptions'

    where "id" = 'UNFPA_Priority_Medicines_MOS';
  `);
};

exports._meta = {
  version: 1,
};
