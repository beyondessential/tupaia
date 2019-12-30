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
  // This migration should affect all `percentagesByGroup` reports.
  // Only one such report exists at the time of writing,
  // with id = 'TO_RH_Descriptive_IMMS_Coverage'
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilder" = 'percentagesPerDataClass',
      "dataBuilderConfig" = 
      '{
        "range": [0, 1],
        "dataClasses": {
          "Hep B Birth Dose": {
            "numerator": { "codes": ["IMMS43"], "type": "single" },
            "denominator": { "codes": ["IMMS42"], "type": "single" }
          },
          "BCG Infant": {
            "numerator": { "codes": ["IMMS41"], "type": "single" },
            "denominator": { "codes": ["IMMS40"], "type": "single" }
          },
          "DPT/HepB/HIB Dose 1": {
            "numerator": { "codes": ["IMMS45"], "type": "single" },
            "denominator": { "codes": ["IMMS44"], "type": "single" }
          },
          "DPT/HepB/HIB Dose 2": {
            "numerator": { "codes": ["IMMS47"], "type": "single" },
            "denominator": { "codes": ["IMMS46"], "type": "single" }
          },
          "DPT/HepB/HIB Dose 3": {
            "numerator": { "codes": ["IMMS49"], "type": "single" },
            "denominator": { "codes": ["IMMS48"], "type": "single" }
          },
          "OPV Dose 1": {
            "numerator": { "codes": ["IMMS53"], "type": "single" },
            "denominator": { "codes": ["IMMS52"], "type": "single" }
          },
          "OPV Dose 2": {
            "numerator": { "codes": ["IMMS55"], "type": "single" },
            "denominator": { "codes": ["IMMS54"], "type": "single" }
          },
          "OPV Dose 3": {
            "numerator": { "codes": ["IMMS57"], "type": "single" },
            "denominator": { "codes": ["IMMS56"], "type": "single" }
          },
          "IPV Dose 1": {
            "numerator": { "codes": ["IMMS51"], "type": "single" },
            "denominator": { "codes": ["IMMS50"], "type": "single" }
          },
          "MR Dose 1": {
            "numerator": { "codes": ["IMMS61"], "type": "single" },
            "denominator": { "codes": ["IMMS60"], "type": "single" }
          },
          "MR Dose 2": {
            "numerator": { "codes": ["IMMS63"], "type": "single" },
            "denominator": { "codes": ["IMMS62"], "type": "single" }
          },
          "DPT Dose 4": {
            "numerator": { "codes": ["IMMS59"], "type": "single" },
            "denominator": { "codes": ["IMMS58"], "type": "single" }
          },
          "DPT5 for School Entry Students 5-6 years old": {
            "numerator": { "codes": ["IMMS79"], "type": "single" },
            "denominator": { "codes": ["IMMS78"], "type": "single" }
          },
          "Td for School Entry Students >7 years old": {
            "numerator": { "codes": ["IMMS79_2"], "type": "single" },
            "denominator": { "codes": ["IMMS79_1"], "type": "single" }
          },
          "Td for High School Leavers": {
            "numerator": { "codes": ["IMMS81"], "type": "single" },
            "denominator": { "codes": ["IMMS80"], "type": "single" }
          }
        }
      }'
    WHERE
      id = 'TO_RH_Descriptive_IMMS_Coverage';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilder" = 'percentagesByGroup',
      "dataBuilderConfig" = 
      '{
        "range": [0, 1],
        "groups": [
          {
            "name": "Hep B Birth Dose",
            "numeratorDataElementCode": "IMMS43",
            "denominatorDataElementCode": "IMMS42"
          },
          {
            "name": "BCG Infant",
            "numeratorDataElementCode": "IMMS41",
            "denominatorDataElementCode": "IMMS40"
          },
          {
            "name": "DPT/HepB/HIB Dose 1",
            "numeratorDataElementCode": "IMMS45",
            "denominatorDataElementCode": "IMMS44"
          },
          {
            "name": "DPT/HepB/HIB Dose 2",
            "numeratorDataElementCode": "IMMS47",
            "denominatorDataElementCode": "IMMS46"
          },
          {
            "name": "DPT/HepB/HIB Dose 3",
            "numeratorDataElementCode": "IMMS49",
            "denominatorDataElementCode": "IMMS48"
          },
          {
            "name": "OPV Dose 1",
            "numeratorDataElementCode": "IMMS53",
            "denominatorDataElementCode": "IMMS52"
          },
          {
            "name": "OPV Dose 2",
            "numeratorDataElementCode": "IMMS55",
            "denominatorDataElementCode": "IMMS54"
          },
          {
            "name": "OPV Dose 3",
            "numeratorDataElementCode": "IMMS57",
            "denominatorDataElementCode": "IMMS56"
          },
          {
            "name": "IPV Dose 1",
            "numeratorDataElementCode": "IMMS51",
            "denominatorDataElementCode": "IMMS50"
          },
          {
            "name": "MR Dose 1",
            "numeratorDataElementCode": "IMMS61",
            "denominatorDataElementCode": "IMMS60"
          },
          {
            "name": "MR Dose 2",
            "numeratorDataElementCode": "IMMS63",
            "denominatorDataElementCode": "IMMS62"
          },
          {
            "name": "DPT Dose 4",
            "numeratorDataElementCode": "IMMS59",
            "denominatorDataElementCode": "IMMS58"
          },
          {
            "name": "DPT5 for School Entry Students 5-6 years old",
            "numeratorDataElementCode": "IMMS79",
            "denominatorDataElementCode": "IMMS78"
          },
          {
            "name": "Td for School Entry Students >7 years old",
            "numeratorDataElementCode": "IMMS79_2",
            "denominatorDataElementCode": "IMMS79_1"
          },
          {
            "name": "Td for High School Leavers",
            "numeratorDataElementCode": "IMMS81",
            "denominatorDataElementCode": "IMMS80"
          }
        ]
      }'
    WHERE
      id = 'TO_RH_Descriptive_IMMS_Coverage';
  `);
};

exports._meta = {
  version: 1,
};
