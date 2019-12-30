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
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": { "BCD46": "doctors", "BCD47": "midwives", "BCD48": "nurses", "BCD48a": "nurses", "BCD48b": "nurses", "BCD49": "aides", "BCD50": "others", "BCD51": "others", "BCD52": "others", "BCD53": "others", "BCD54": "others", "BCD55": "others" }}'
    WHERE id = '8';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": { "BCD14": "Contact Phone Number", "DP9": "Inpatient beds"}}'
    WHERE id = '34';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"SS162": "Vaccination at facility", "DP9": "Inpatient beds"} }'
    WHERE id = '19';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"BCD47": "midwives"} }'
    WHERE id = '24';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"BCD25": "Fridge working", "BCD26": "Thermometer"} }'
    WHERE id = '4';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"PVSH1": "consumables", "PVSH3": "equipment", "PVSH2": "medicines", "PVSH4": "testing kits"} }'
    WHERE id = '6';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"PercentageCriticalMedicinesAvailable": "available"} }'
    WHERE id = '9';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"PercentageCriticalMedicinesAvailable": "available", "PercentageCriticalMedicinesOutOfStock": "out of stock", "PercentageCriticalMedicinesExpired": "expired"} }'
    WHERE id = '16';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"SS162": "Vaccination at facility", "DP9": "Inpatient beds"} }'
    WHERE id = '18';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"DP1A": "Facility currently operational", "DP17": "Functional communication system", "DP18": "Functional means of transportation", "DP67": "Bulk warehouse capacity", "DP71": "Displaced people in catchment area", "DP74A": "Building is damaged"} }'
    WHERE id = '30';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"SS162": "Vaccination at facility", "SS163": "Vaccination as outreach"} }'
    WHERE id = '21';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"BCD25": "Facilities with working fridges", "BCD31": "Facilities with clean water", "BCD32": "Facilities with functional toilets"} }'
    WHERE id = '27';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"PVSH1": "consumables", "PVSH3": "equipment", "PVSH2": "medicines", "PVSH4": "testing kits"} }'
    WHERE id = '7';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"PercentageCriticalMedicinesAvailable": "available", "PercentageCriticalMedicinesOutOfStock": "out of stock", "PercentageCriticalMedicinesExpired": "expired"} }'
    WHERE id = '17';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"labels": {"DP74J_TEXT": "Damage to Water Supply", "DP74H_TEXT": "Damage to Electricity"} }'
    WHERE id = '35';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
