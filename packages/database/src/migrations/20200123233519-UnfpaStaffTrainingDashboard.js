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
  return db.runSql(`
  INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson") VALUES (
    'UNFPA_Staff_Trained_Matrix',
    'TableOfDataValuesWithCalc',
    '{
		"rows": [{
			"rows": ["ANC (including part time staff)", "Staff trained in the provision of modern contraceptives",
				"Staff trained in delivery services", "Service providers trained to detect, discuss, and refer clients to services that handle sexual and gender-based violence",
				"Have any staff been trained to provide SRH services to adolescents and youth",
				"Have any staff been trained to provide services to survivors of rape or other gender based violence?"
			],
			"category": "$orgUnit"
		}],
		"cells": [
			[{
				"dataElement": "RHS1UNFPA61",
 				"dataValues": ["RHS1UNFPA5601", "RHS1UNFPA57", "RHS1UNFPA5902", "RHS1UNFPA60", "RHS1UNFPA6001", "RHS1UNFPA61"],
				"action":  "SUM"}
			],
			[{"dataElement": "RHS4UNFPA809"}],
			[{"dataElement": "RHS3UNFPA5410"}],
			[{"dataElement": "RHS2UNFPA292"}],
			[{"dataElement": "RHS2UNFPA240"}],
			[{"dataElement": "RHS2UNFPA291"}]
		],
		"columns": ["Base Line", "Q1", "Q2", "Q3", "Q4"],
		"MaxBaseLine": "20200101",
		"MinBaseLine": "20180101"
	}',
    '{"name": "SRH Staff Trained Matrix", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png", "periodGranularity": "one_year_at_a_time"}'
    );

    UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{UNFPA_Staff_Trained_Matrix}'
        WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    delete from "dashboardReport" where id = 'UNFPA_Staff_Trained_Matrix';
    update "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Staff_Trained_Matrix')
      WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';
`);
};

exports._meta = {
  version: 1,
};
