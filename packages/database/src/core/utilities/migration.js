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

export const insertObject = async (db, table, data, onError) =>
  db.insert(table, Object.keys(data), Object.values(data), onError);

export const deleteObject = async (db, table, condition) => {
  const where = Object.entries(condition)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(' AND ');
  return db.runSql(`
      DELETE FROM "${table}"
      WHERE ${where}
  `);
};

// query should be actual sql statement, e.g. `SELECT * FROM dashboard_item WHERE code = 'xxx';`
// to use an object condition see 'findSingleRecord' below
export const findSingleRecordBySql = async (db, query) => {
  const { rows: results } = await db.runSql(query);
  if (results.length === 0) {
    throw new Error(`No results for ${query}`);
  }
  if (results.length > 1) {
    throw new Error(`Expected one result, got ${results.length} for ${query}`);
  }
  return results[0];
};

export const findSingleRecord = async (db, table, condition) => {
  const where = Object.entries(condition)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(' AND ');
  const query = `
    SELECT * FROM "${table}"
    WHERE ${where}
  `;
  return findSingleRecordBySql(db, query);
};

export const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');
export const arrayToDoubleQuotedDbString = array => array.map(item => `"${item}"`).join(', '); // For formatting Postgres text[]

export const codeToId = async (db, table, code) => {
  const record = await db.runSql(`SELECT id FROM "${table}" WHERE code = '${code}'`);
  return record.rows[0] && record.rows[0].id;
};

export const nameToId = async (db, table, name) => {
  const record = await db.runSql(`SELECT id FROM "${table}" WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

export const createForeignKeyConfig = (
  localTable,
  localColumn,
  foreignTable,
  foreignColumn = 'id',
) => ({
  name: `${localTable}_${localColumn}_${foreignTable}_${foreignColumn}_fk`,
  table: foreignTable,
  rules: {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  mapping: foreignColumn,
});

const assertParamsAreDefined = (params, methodName) => {
  Object.entries(params).forEach(([paramName, paramValue]) => {
    if (paramValue === undefined) {
      throw new RequiredParameterError(paramName, methodName);
    }
  });
};

const getQueryString = (arr, separator) => arr.map(item => `"${item}" = ?`).join(separator);

const getWhereQuery = (condition, newValues = {}) => {
  const isStringCondition = typeof condition === 'string';
  const whereQuery = isStringCondition
    ? condition
    : getQueryString(Object.keys(condition), ' AND ');
  const params = Object.values(newValues).concat(isStringCondition ? [] : Object.values(condition));

  return { whereQuery, params };
};

export async function updateValues(db, table, newValues, condition) {
  assertParamsAreDefined({ db, table, newValues, condition }, 'updateValues');
  const { whereQuery, params } = getWhereQuery(condition, newValues);
  const setQuery = getQueryString(Object.keys(newValues), ', ');

  return db.runSql(`UPDATE "${table}" SET ${setQuery} WHERE ${whereQuery}`, params);
}

const getJsonColumnValueString = values => {
  if (Array.isArray(values)) {
    const arrayString = values
      .map(item => (typeof item === 'string' ? `"${item}"` : item))
      .join(',');
    return `[${arrayString}]`;
  }

  if (typeof values === 'object') {
    return JSON.stringify(values);
  }

  throw new Error('Function getJsonColumnValueString: we should either insert object or array');
};

const insertOrUpdateRootJsonEntry = async (db, table, column, value, condition) => {
  assertParamsAreDefined({ db, table, column, value, condition }, 'insertOrUpdateRootJsonEntry');
  const { whereQuery, params } = getWhereQuery(condition);

  await db.runSql(
    `UPDATE "${table}" tb
     SET "${column}" = 
          tb."${column}" || '${getJsonColumnValueString(value)}'                  
     WHERE ${whereQuery};`,
    params,
  );
};

export const insertJsonEntry = async (db, table, column, path, value, condition) => {
  assertParamsAreDefined({ db, table, column, path, value, condition }, 'insertJsonEntry');
  if (path.length === 0) {
    return insertOrUpdateRootJsonEntry(db, table, column, value, condition);
  }

  const { whereQuery, params } = getWhereQuery(condition);
  await db.runSql(
    `UPDATE "${table}" tb
     SET "${column}" = 
          JSONB_SET(tb."${column}",'{${path.toString()}}', 
                    tb."${column}"::jsonb #> '{${path.toString()}}' || '${getJsonColumnValueString(
      value,
    )}'
                    )
     WHERE ${whereQuery};`,
    params,
  );
};

export const removeJsonEntry = async (db, table, column, path, key, condition) => {
  assertParamsAreDefined({ db, table, column, path, key, condition }, 'removeJsonEntry');
  const { whereQuery, params } = getWhereQuery(condition);
  return db.runSql(
    `UPDATE "${table}" tb
     SET "${column}" = 
          REPLACE(tb."${column}"::text,
                  tb."${column}"::jsonb #>> '{${path.toString()}}',  
                  tb."${column}"::jsonb #> '{${path.toString()}}' #- '{${key}}' #>> '{}'
                  ) :: jsonb 
     WHERE ${whereQuery};`,
    params,
  );
};

export const updateJsonEntry = async (db, table, column, path, value, condition) => {
  assertParamsAreDefined({ db, table, column, path, value, condition }, 'updateJsonEntry');
  Object.keys(value).map(async key => {
    await removeJsonEntry(db, table, column, path, key, condition);
  });

  await insertJsonEntry(db, table, column, path, value, condition);
};

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
 * @param {DbValue} value
 * @param {string} condition
 * @returns {Promise}
 * @throws {RequiredParameterError}
 */
export async function addArrayValue(db, table, column, value, condition) {
  assertParamsAreDefined({ db, table, column, value, condition }, 'addArrayValue');

  return db.runSql(
    `UPDATE "${table}" SET "${column}" = array_append("${column}", ?) WHERE ${condition}`,
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
  const newValuesPlaceholder = Array(newValues.length).fill('?').join(',');

  // Use `ARRAY[?,...]` syntax instead of `'{?...}'` because db-migrate treats the
  // second syntax as a string literal
  return db.runSql(
    `UPDATE "${table}" SET "${column}" = array_remove("${column}", ?) || ARRAY[${newValuesPlaceholder}] WHERE ${condition}`,
    [oldValue, ...newValues],
  );
}

/**
 * PostgreSQL does not supporting removing values from an enum,
 * so instead of that we can replace an existing enum with a new one
 *
 * @param {TupaiaDatabase} db
 * @param {string} enumName
 * @param {string[]} enumValues
 */
export const replaceEnum = (db, enumName, enumValues) => {
  const enumNameTemp = `${enumName}_temp$`;

  // Caution! `db` here should be our internal database, not the db provided by `db-migrate`
  return db.executeSql(`
      ALTER TYPE ${enumName} RENAME TO ${enumNameTemp};
      CREATE TYPE ${enumName} AS ENUM(${arrayToDbString(enumValues)});
      ALTER TABLE entity ALTER COLUMN type TYPE ${enumName} USING type::text::${enumName};
      DROP TYPE ${enumNameTemp};
    `);
};

/**
 * Use to calculate "bounds" for all entities with a region
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

/**
 * @deprecated
 * Tables "dashboardReport" and "dashboardGroup" have been dropped.
 * Please use "dashboard", "dashboard_relation" and "dashboard_item"
 */
export function addReportToGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{"${reportId}"}'
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

/**
 * @deprecated
 * Tables "dashboardReport" and "dashboardGroup" have been dropped.
 * Please use "dashboard", "dashboard_relation" and "dashboard_item"
 */
export function removeReportFromGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" IN (${arrayToDbString(groupCodes)});
  `);
}

/**
 * @deprecated
 * Tables "dashboardReport" and "dashboardGroup" have been dropped.
 * Please use "dashboard", "dashboard_relation" and "dashboard_item"
 */
export function deleteReport(db, reportId) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = '${reportId}';
  `);
}

export const buildSingleColumnTableCells = ({
  prefix = '',
  start = 0,
  end = 0,
  skipCells = [],
  addColumnTotal = false,
} = {}) => {
  const cells = [];
  for (let i = start; i <= end; i++) {
    if (skipCells.includes(i)) {
      continue;
    }
    cells.push([`${prefix}${i}`]);
  }

  if (addColumnTotal) {
    cells.push(['$columnTotal']);
  }

  return cells;
};

export const build2DTableCells = ({
  prefix = '',
  numRows = 0,
  numCols = 0,
  startCell = 0,
  skipCells = [],
  insertCells = [],
  addRowTotal = false,
  addColumnTotal = false,
} = {}) => {
  const cells = [];

  let i = startCell;
  for (let row = 0; row < numRows - (addColumnTotal ? 1 : 0); row++) {
    const cellRow = [];
    for (let column = 0; column < numCols - (addRowTotal ? 1 : 0); column++) {
      const insertCell = insertCells.find(cell => {
        return cell.rowIndex === row && cell.colIndex === column;
      });

      if (insertCell) {
        cellRow.push(insertCell.name);
      } else {
        cellRow.push(`${prefix}${i}`);
        i++;
        while (skipCells.includes(i)) {
          // Data element does not exist, skip
          i++;
        }
      }
    }
    if (addRowTotal) {
      cellRow.push('$rowTotal');
    }

    cells.push(cellRow);
  }

  if (addColumnTotal) {
    cells.push(
      Object.keys(new Array(numCols).fill(null)).map(index => {
        if (addRowTotal && index == numCols - 1) {
          return '$total'; // If both rowTotal and colTotal, mark as tableTotal
        }

        return '$columnTotal';
      }),
    );
  }

  return cells;
};

export const build2dTableStringFormatCells = (format, rows, cols, { addRowTotal = false } = {}) => {
  const cells = [];

  rows.forEach(row => {
    const cellRow = [];
    cols.forEach(col => {
      cellRow.push(format(row, col));
    });

    if (addRowTotal) {
      cellRow.push('$rowTotal');
    }

    cells.push(cellRow);
  });

  return cells;
};
