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
	delete from "dashboardReport" where id = 'UNFPA_Staff_Trained_Matrix';
	update "dashboardGroup"
	SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Staff_Trained_Matrix')
		WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';


	INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson") VALUES (
	'UNFPA_Staff_Trained_Matrix',
	'tableOfDataValuesWithCalc',
	'{
		"dataElementGroupCode": "SRHStaffTraining",
		"rows": ["Staff trained in the provision of modern contraceptives", "ANC (including part time staff)",
			"Service providers trained to detect, discuss, and refer clients to services that handle sexual and gender-based violence", "Staff trained in delivery services",				
			"Have any staff been trained to provide services to survivors of rape or other gender based violence?",
			"Have any staff been trained to provide SRH services to adolescents and youth"
		],
		"cells": [
			["BAYUI37nJ27"],
			[{
				"dataElement": "PVMX8m9KrgT",
				"dataValues": ["xDT68q89i7J", "WGsYZDuaE2w", "QleUiYGlH2K", "GtrLIeauSmj", "PVMX8m9KrgT"],
				"action":  "SUM"}
			],
			["YRdwZOXcj6s"],
			["pHp0X0JkZQH"],
			["JIvHqMTozrX"],
			["aoZkMRVLynz"]
		],
		"columns": [{"name": "Base Line", "showYear":"true"}, "Q1", "Q2", "Q3", "Q4"],
		"MaxBaseLine": "2020-01-01",
		"MinBaseLine": "2018-01-01"

	}',
	'{"name": "SRH Staff Trained Matrix", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png", "periodGranularity": "one_year_at_a_time"}'
	);

	UPDATE "dashboardGroup"
		SET "dashboardReports" = "dashboardReports" || '{UNFPA_Staff_Trained_Matrix}'
		WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';
  `);
};

exports.down = function (db) {
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
