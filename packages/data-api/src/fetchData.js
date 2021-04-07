/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from './SqlQuery';

const AGGREGATIONS = {
  FINAL_EACH_DAY: {
    periodColumns: ['day_period'],
    useA2Join: true,
  },
  FINAL_EACH_WEEK: {
    periodColumns: ['week_period'],
    useA2Join: true,
  },
  FINAL_EACH_MONTH: {
    periodColumns: ['month_period'],
    useA2Join: true,
  },
  FINAL_EACH_YEAR: {
    periodColumns: ['year_period'],
    useA2Join: true,
  },
  MOST_RECENT: {
    periodColumns: [],
    useA2Join: true,
  },
  DEFAULT: {
    useA2Join: false,
  },
};

const ANSWER_SPECIFIC_FIELDS = ['entity_name', 'date', 'event_id', 'value', 'type']; // Fields unique to each answer

const hasElements = options => options.dataElementCodes.length > 0;

const getCommonFields = options => {
  const fields = ['entity_code'];
  if (hasElements(options)) {
    fields.push('data_element_code');
  }
  return fields;
};

const getAliasedColumns = options => {
  const aliasedColumns = [
    'date',
    'entity_code AS "entityCode"',
    'entity_name AS "entityName"',
    'event_id AS "eventId"',
    'value',
    'type',
  ];
  if (hasElements(options)) {
    aliasedColumns.push('data_element_code AS "dataElementCode"');
  }
  return aliasedColumns.join(', ');
};

const getA1Select = (firstAggregation, options) => {
  const fields = getCommonFields(options);
  return `SELECT ${fields
    .concat(firstAggregation.useA2Join ? firstAggregation.periodColumns : ANSWER_SPECIFIC_FIELDS)
    .join(', ')}`;
};

const getA1Join = (options, paramsArray) => {
  const { dataElementCodes, organisationUnitCodes } = options;

  const createJoin = (codes, columnName) => `
       INNER JOIN (
         ${SqlQuery.parameteriseValues(codes, paramsArray)}
       ) ${columnName}s(code) ON ${columnName}s.code = analytics.${columnName}`;

  const joins = [createJoin(organisationUnitCodes, 'entity_code')];
  if (hasElements(options)) {
    joins.push(createJoin(dataElementCodes, 'data_element_code'));
  }
  return joins.join('\n');
};

const getA1WhereClause = (options, paramsArray) => {
  const { dataGroupCode, eventId, startDate, endDate } = options;

  const conditions = [];
  if (dataGroupCode) {
    conditions.push('data_group_code = ?');
    paramsArray.push(dataGroupCode);
  }
  if (eventId) {
    conditions.push('event_id = ?');
    paramsArray.push(eventId);
  }
  if (startDate) {
    conditions.push('date >= ?');
    paramsArray.push(startDate);
  }
  if (endDate) {
    conditions.push('date <= ?');
    paramsArray.push(endDate);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

const getA1GroupByClause = (firstAggregation, options) => {
  const fields = getCommonFields(options);
  return firstAggregation.useA2Join
    ? `GROUP BY ${fields.concat(firstAggregation.periodColumns).join(', ')}`
    : '';
};

const getA2WhereClause = (firstAggregation, options, paramsArray) => {
  const { startDate, endDate } = options;
  const fields = getCommonFields(options);

  const whereClauses = fields
    .concat(firstAggregation.periodColumns)
    .map(field => `${field} = a1.${field}`);
  if (startDate) {
    whereClauses.push('date >= ?');
    paramsArray.push(startDate);
  }
  if (endDate) {
    whereClauses.push('date <= ?');
    paramsArray.push(endDate);
  }
  return `WHERE ${whereClauses.join('\n      AND ')}`;
};

const getA2Join = (firstAggregation, options, paramsArray) =>
  firstAggregation.useA2Join
    ? `CROSS JOIN LATERAL (
      SELECT ${ANSWER_SPECIFIC_FIELDS}
      FROM analytics
      ${getA2WhereClause(firstAggregation, options, paramsArray)}
      order by date desc
      limit 1
    ) as a2`
    : '';

const generateBaseSqlQuery = options => {
  const firstAggregation = AGGREGATIONS[options.aggregations?.[0]?.type] || AGGREGATIONS.DEFAULT;
  const paramsArray = [];

  const sqlQuery = new SqlQuery(
    `
    SELECT ${getAliasedColumns(options)}
    FROM (
      ${getA1Select(firstAggregation, options)}
      FROM analytics
       ${getA1Join(options, paramsArray)}
       ${getA1WhereClause(options, paramsArray)}
       ${getA1GroupByClause(firstAggregation, options)}
    ) as a1
    ${getA2Join(firstAggregation, options, paramsArray)}`,
    paramsArray,
  );
  sqlQuery.addOrderByClause('date');

  return sqlQuery;
};

export async function fetchData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  return sqlQuery.executeOnDatabase(database);
}
