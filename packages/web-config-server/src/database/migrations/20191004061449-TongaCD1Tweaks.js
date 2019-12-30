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

// The following was lifted from 20190920020842-AddCD1ValidationReport.js

const getDataElementsInRange = (start, end) => {
  const elements = [];
  for (let i = start; i <= end; i++) {
    elements.push(`CD${i}`);
  }

  return elements;
};

const getReportColumnsInRange = (start, end) => {
  const columns = {};
  getDataElementsInRange(start, end).forEach(element => {
    columns[element] = {};
  });

  return columns;
};

const getReportColumns = () => {
  let columns = getReportColumnsInRange(2, 5);
  columns['CD5a'] = {}; // 5a has been added
  Object.assign(columns, getReportColumnsInRange(6, 8));
  columns['CD9'] = { additionalData: ['CD10'] };
  columns['CD11'] = { additionalData: ['CD12'] };
  // 13 and 14 have been deleted
  columns['CD15'] = { additionalData: ['CD16'] };
  columns['CD17'] = {
    additionalData: getDataElementsInRange(18, 22),
    shouldNumberLines: true,
    title: 'Organism Sensitivity',
  };
  columns['CD23'] = {
    additionalData: getDataElementsInRange(24, 28),
    shouldNumberLines: true,
    title: 'Organism Resistance',
  };
  columns['CD29'] = {
    additionalData: getDataElementsInRange(30, 31),
    shouldNumberLines: true,
    title: 'Organism S/R Indeterminate',
  };
  columns['CD32'] = {
    additionalData: ['CD33'],
    shouldNumberLines: true,
    title: 'Organism S/R Out of Stock',
  };

  return columns;
};

const REPORT_COLUMNS = getReportColumns();

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "columns": ${JSON.stringify(
        REPORT_COLUMNS,
      )} }'
      WHERE id = 'TO_CD_Validation_CD1';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
