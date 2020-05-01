'use strict';

var dbm;
var type;
var seed;

const ALL_RESPONSE_VALUES = ['Treatment in Progress', 'Treated', 'Untreated', 'No Treatment Required', 'Unknown'];

const DATA_BUILDER_CONFIG = {
  "dataClasses": {
    "Treatment in Progress": {
      "numerator": {
        "dataValues": {
          "CD3b_015": {
            "value": 'Treatment in Progress',
            "operator": "="
          }
        }
      },
      "denominator": {
        "dataValues": {
          "CD3b_015": {
            "value": ALL_RESPONSE_VALUES,
            "operator": "in"
          }
        }
      }
    },
    "Treated": {
      "numerator": {
        "dataValues": {
          "CD3b_015": {
            "value": 'Treated',
            "operator": "="
          }
        }
      },
      "denominator": {
        "dataValues": {
          "CD3b_015": {
            "value": ALL_RESPONSE_VALUES,
            "operator": "in"
          }
        }
      }
    },
    "Untreated": {
      "numerator": {
        "dataValues": {
          "CD3b_015": {
            "value": 'Untreated',
            "operator": "="
          }
        }
      },
      "denominator": {
        "dataValues": {
          "CD3b_015": {
            "value": ALL_RESPONSE_VALUES,
            "operator": "in"
          }
        }
      }
    },
    "No Treatment Required": {
      "numerator": {
        "dataValues": {
          "CD3b_015": {
            "value": 'No Treatment Required',
            "operator": "="
          }
        }
      },
      "denominator": {
        "dataValues": {
          "CD3b_015": {
            "value": ALL_RESPONSE_VALUES,
            "operator": "in"
          }
        }
      }
    },
    "Unknown": {
      "numerator": {
        "dataValues": {
          "CD3b_015": {
            "value": 'Unknown',
            "operator": "="
          }
        }
      },
      "denominator": {
        "dataValues": {
          "CD3b_015": {
            "value": ALL_RESPONSE_VALUES,
            "operator": "in"
          }
        }
      }
    }
  },
  "programCode": "CD3b"
};

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const VIEW_JSON_CONFIG = {
  "name": " Outcome of contact tracing",
  "type": "chart",
  "chartType": "pie",
  "periodGranularity": "one_month_at_a_time",
  "valueType": "percentage"
};

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES (
      'TO_CD_Outcome_Of_Contact_Tracing',
      'percentagesOfEventCounts',
      '${JSON.stringify(DATA_BUILDER_CONFIG)}',
      '${JSON.stringify(VIEW_JSON_CONFIG)}',
      '[{"isDataRegional": false}]'
    );

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{TO_CD_Outcome_Of_Contact_Tracing}'
    WHERE code = 'Tonga_Communicable_Diseases_National'
    AND "organisationLevel" = 'Country';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'TO_CD_Outcome_Of_Contact_Tracing';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'TO_CD_Outcome_Of_Contact_Tracing')
    WHERE code = 'Tonga_Communicable_Diseases_National'
    AND "organisationLevel" = 'Country';
  `);
};

exports._meta = {
  "version": 1
};
