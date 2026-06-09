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
      set "dataBuilderConfig" = '{
        "dataClasses" : {
          "Number of facilities with updated stock cards for RH commodities" : {
            "numerator" : {
              "dataValues" : [
                "RHS6UNFPA1302",
                "RHS6UNFPA1211",
                "RHS6UNFPA1224",
                "RHS6UNFPA1237",
                "RHS6UNFPA1250",
                "RHS6UNFPA1263",
                "RHS6UNFPA1276",
                "RHS6UNFPA1289"
              ],
              "valueOfInterest": 1
            },
            "denominator" : "$orgUnitCount"
          },
          "Number of facilities using stock cards for RH commodities" : {
            "numerator" : {
              "dataValues" : [
                "RHS6UNFPA1210",
                "RHS6UNFPA1223",
                "RHS6UNFPA1236",
                "RHS6UNFPA1249",
                "RHS6UNFPA1262",
                "RHS6UNFPA1275",
                "RHS6UNFPA1288",
                "RHS6UNFPA1301"
              ],
              "valueOfInterest": 1
            },
            "denominator" : "$orgUnitCount"
          }
        }
      }' where id = 'UNFPA_RH_Stock_Cards';
    
    update "dashboardReport"
      set "dataBuilderConfig" = '{
        "dataClasses" : {
          "delivery" : {
            "numerator" : {
              "dataValues" : [
                "RHS3UNFPA536"
              ],
              "valueOfInterest": 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS3UNFPA536"
              ],
              "valueOfInterest": "*"
            }
          }
        },
        "periodType" : "month"
      }' where id = 'UNFPA_Facilities_Offering_Delivery';

    update "dashboardReport"
      set "dataBuilderConfig" = '{
        "dataClasses" : {
          "Family Planning" : {
            "numerator" : {
              "dataValues" : [
                "RHS4UNFPA807"
              ],
              "valueOfInterest": 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS4UNFPA807"
              ],
              "valueOfInterest": "*"
            }
          },
          "ANC Services" : {
            "numerator" : {
              "dataValues" : [
                "RHS3UNFPA4121"
              ],
              "valueOfInterest": 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS3UNFPA4121"
              ],
              "valueOfInterest": "*"
            }
          },
          "PNC Services" : {
            "numerator" : {
              "dataValues" : [
                "RHS3UNFPA464"
              ],
              "valueOfInterest": 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS3UNFPA464"
              ],
              "valueOfInterest": "*"
            }
          }
        },
        "periodType" : "month"
      }' where id = 'UNFPA_Facilities_Offering_Services';

    update "dashboardReport"
      set "dataBuilderConfig" = '{
        "filter" : {
          "name" : "filterFacility",
          "comparator" : "<>"
        },
        "periodType" : "month",
        "dataClasses" : {
          "value" : {
            "numerator" : {
              "dataValues" : [
                "RHS6UNFPA1354"
              ],
              "valueOfInterest": 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS6UNFPA1354"
              ],
              "valueOfInterest": "*"
            }
          }
        }
      }' where id = 'UNFPA_Monthly_3_Methods_of_Contraception';

    update "dashboardReport"
      set "dataBuilderConfig" = '{
        "filter" : {
          "name" : "filterFacility",
          "comparator" : "="
        },
        "periodType" : "month",
        "dataClasses" : {
          "value" : {
            "numerator" : {
              "dataValues" : [
                "RHS6UNFPA1355"
              ],
              "valueOfInterest": 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS6UNFPA1355"
              ],
              "valueOfInterest": "*"
            }
          }
        }
      }' where id = 'UNFPA_Monthly_5_Methods_of_Contraception';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
