/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * A value that can be inserted in the database
 *
 * @typedef {(Object<string, any>|string|number|boolean)} DbValue
 */

class RequiredParameterError extends Error {
  /**
   * @param {string} paramName
   * @param {string} methodName
   */
  constructor(paramName, methodName) {
    super(`${paramName} is a required parameter for ${methodName}()`);
    this.name = 'RequiredParameterError';
  }
}

export const rejectOnError = (resolve, reject, error) => {
  if (error) {
    console.error(error);
    reject(error);
  } else {
    resolve();
  }
};

export function insertMultipleObjects(db, table, objects) {
  var chain = Promise.resolve();
  objects.map(o => {
    chain = chain.then(() => insertObject(db, table, o));
  });
  return chain;
}

export function insertObject(db, table, data) {
  const entries = Object.entries(data);
  const keys = entries.map(([k, v]) => k);
  const values = entries.map(([k, v]) => v);
  return new Promise((resolve, reject) => {
    return db.insert(table, keys, values, error => rejectOnError(resolve, reject, error));
  });
}

export const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

/**
 * @param {Object<string, any>} params
 * @throws {RequiredParameterError}
 */
const assertParamsAreDefined = (params, methodName) => {
  Object.entries(params).forEach(([paramName, paramValue]) => {
    if (paramValue === undefined) {
      throw new RequiredParameterError(paramName, methodName);
    }
  });
};

/**
 * @param {string} db
 * @param {string} table
 * @param {string} column
 * @param {Object<string, DbValue>} newValues A map of column names to new values
 * @param {(Object<string, DbValue>|string)} condition If an object is provided, it will be interpreted
 * as { columnName: value }. If a string is provided, it will be used as is
 * @returns {Promise}
 * @throws {RequiredParameterError}
 */
export async function updateValues(db, table, newValues, condition) {
  assertParamsAreDefined({ db, table, newValues, condition }, 'updateValues');

  const isStringCondition = typeof condition === 'string';
  const getQueryString = (arr, separator) => arr.map(item => `"${item}" = ?`).join(separator);

  const setQuery = getQueryString(Object.keys(newValues), ', ');
  const whereQuery = isStringCondition
    ? condition
    : getQueryString(Object.keys(condition), ' AND ');

  return db.runSql(
    `UPDATE "${table}" SET ${setQuery} WHERE ${whereQuery}`,
    Object.values(newValues).concat(isStringCondition ? [] : Object.values(condition)),
  );
}

/**
 * @param {string} db
 * @param {string} table
 * @param {string} column The name of the column. must be of `Array` type
 * @param {DbValue} value
 * @param {string} condition
 * @returns {Promise}
 * @throws {RequiredParameterError}
 */
export async function removeArrayValue(db, table, column, value, condition) {
  assertParamsAreDefined({ db, table, column, value, condition }, 'removeArrayValue');

  return db.runSql(
    `UPDATE "${table}" SET "${column}" = array_remove("${column}", ?) WHERE ${condition}`,
    [value],
  );
}

/**
 * @param {string} db
 * @param {string} table
 * @param {string} column The name of the column. must be of `Array` type
 * @param {DbValue} oldValue
 * @param {DbValue|DbValue[]} newValueInput
 * @param {string} condition
 * @returns {Promise}
 * @throws {RequiredParameterError}
 */
export async function replaceArrayValue(db, table, column, oldValue, newValueInput, condition) {
  assertParamsAreDefined(
    { db, table, column, oldValue, newValueInput, condition },
    'replaceArrayValue',
  );

  const newValues = Array.isArray(newValueInput) ? newValueInput : [newValueInput];
  const newValuesPlaceholder = Array(newValues.length)
    .fill('?')
    .join(',');

  // Use `ARRAY[?,...]` syntax instead of `'{?...}'` because db-migrate treats the
  // second syntax as a string literal
  return db.runSql(
    `UPDATE "${table}" SET "${column}" = array_remove("${column}", ?) || ARRAY[${newValuesPlaceholder}] WHERE ${condition}`,
    [oldValue, ...newValues],
  );
}

/**
 * Use to calculate "bounds" for all entities of type "region" or "facility".
 * Will only calculate for entities with NULL bounds, i.e. use this for newly
 * added entities, not for updating entities with existing bounds.
 *
 * NOTE: Keep in mind if you change this function, it WILL alter past migrations.
 */
export function populateEntityBounds(db) {
  return db.runSql(`
    UPDATE "entity"
    SET
      "bounds" = ST_Expand(ST_Envelope("point"::geometry), 1)
    WHERE
      "bounds" IS NULL
      AND "point" IS NOT NULL;

    UPDATE "entity"
    SET
      "bounds" = ST_Envelope("region"::geometry)
    WHERE
      "bounds" IS NULL
      AND "region" IS NOT NULL;
  `);
}

/**
 * ~~~~Utility Templates~~~~~
 * !DO NOT EXPORT AND IMPORT!
 * These represent the currently accepted way of performing common database migration functions
 * Copy paste any of the following functions into migrations and use them at your leisure
 * However, we should avoid export/import as it makes it easy to break old migrations by modifying
 * the common utility code. Unlike the migrations that are exported, these rely on specific column
 * names etc. which make them liable to change over time.
 */

/* eslint-disable no-unused-vars */

// Add a dashboard report to a dashboard group
function addReportToGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{"${reportId}"}'
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

// Remove a dashboard report from a dashboard group
function removeReportFromGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

// Delete a report
function deleteReport(db, reportId) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = '${reportId}';
  `);
}

// Update data builder configuration for a report
async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}
