'use strict';

import { updateValues } from '../utilities';

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

const getDotMatrixReports = async db => {
  const result = await db.runSql(`
    SELECT *
    FROM "dashboardReport"
    WHERE "viewJson"->>'presentationOptions' is not null and "viewJson"->>'type' = 'matrix'
  `);

  return result.rows || [];
};

const updateViewJsonByReportId = async (db, newJson, reportId) => {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
};

const transformPresentationOptions = presentationOptions => {
  const transformed = {
    conditions: [],
  };

  for (const [key, value] of Object.entries(presentationOptions)) {
    if (value.color) {
      transformed.conditions.push({ key, ...value });
    } else {
      transformed[key] = value;
    }
  }

  return transformed;
};

const reverseTransformPresentationOptions = presentationOptions => {
  const transformed = { ...presentationOptions };

  delete transformed.conditions;

  for (const condition of presentationOptions.conditions) {
    transformed[condition.key] = condition;
    delete transformed[condition.key].key;
  }

  return transformed;
};

/*
 * Old schema:
 *
 * viewJson = {
 *   presentationOptions: {
 *     red: {
 *       color: "#b71c1c",
 *       label: "",
 *       condition: 0,
 *       description: "Months of stock: "
 *     },
 *     green: {...},
 *     blue: {...},
 *     type: "condition",
 *     showRawValue: true,
 *   }
 * }
 *
 * This has the problem of:
 *   - 1. conditions and other properties are adjacent, making iterating conditions hard
 *   - 2. conditions are object properties, and object property order is undefined in es6, meaning they cant be ordered e.g. for display in a legend
 *
 * New schema:
 *
 * viewJson = {
 *   presentationOptions: {
 *     conditions: [
 *       {
 *         key: "red",
 *         color: "#b71c1c",
 *         label: "",
 *         condition: 0,
 *         description: "Months of stock: "
 *       },
 *       {...},
 *       {...},
 *     ],
 *     type: "condition",
 *     showRawValue: true,
 *   }
 * }
 */
exports.up = async function (db) {
  const reports = await getDotMatrixReports(db);

  for (const report of reports) {
    const { presentationOptions } = report.viewJson;

    report.viewJson.presentationOptions = transformPresentationOptions(presentationOptions);

    await updateViewJsonByReportId(db, report.viewJson, report.id);
  }

  return null;
};

exports.down = async function (db) {
  const reports = await getDotMatrixReports(db);

  for (const report of reports) {
    const { presentationOptions } = report.viewJson;

    report.viewJson.presentationOptions = reverseTransformPresentationOptions(presentationOptions);

    await updateViewJsonByReportId(db, report.viewJson, report.id);
  }

  return null;
};

exports._meta = {
  version: 1,
};
