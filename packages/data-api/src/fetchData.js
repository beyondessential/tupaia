/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { utcMoment } from '@tupaia/utils';

import { SqlQuery } from './SqlQuery';

const SUPPORTED_AGGREGATIONS = [
  'FINAL_EACH_DAY',
  'FINAL_EACH_WEEK',
  'FINAL_EACH_MONTH',
  'FINAL_EACH_YEAR',
  'MOST_RECENT',
];

const COMMON_FIELDS = 'data_element_code, entity_code, entity_name';
const ANSWER_SPECIFIC_FIELDS = 'date, event_id, value, answer_type';

const getA1WhereClause = conditions => {
  let hasAnyCondition = false;
  let clause = '';
  for (const [condition, value] of Object.entries(conditions)) {
    if (!value) {
      continue;
    }

    clause = `${clause}
              ${hasAnyCondition ? 'AND' : 'WHERE'}`;
    switch (condition) {
      case 'surveyCode':
        clause = `${clause} survey_code = ?`;
        break;
      case 'eventId':
        clause = `${clause} event_id = ?`;
        break;
      case 'startDate':
        clause = `${clause} date > ?`;
        break;
      case 'endDate':
        clause = `${clause} date < ?`;
        break;
      default:
        throw new Error(`Unknown condition in fetch data where clause: ${condition}`);
    }
    hasAnyCondition = true;
  }

  return clause;
};

const getA1GroupByClause = firstAggregationType => {
  switch (firstAggregationType) {
    case 'FINAL_EACH_DAY':
      return `GROUP BY ${COMMON_FIELDS}, day_period`;
    case 'FINAL_EACH_WEEK':
      return `GROUP BY ${COMMON_FIELDS}, week_period`;
    case 'FINAL_EACH_MONTH':
      return `GROUP BY ${COMMON_FIELDS}, month_period`;
    case 'FINAL_EACH_YEAR':
      return `GROUP BY ${COMMON_FIELDS}, year_period`;
    case 'MOST_RECENT':
      return `GROUP BY ${COMMON_FIELDS}`;
    default:
      return '';
  }
};

const getA2FinalWhereClause = firstAggregationType => {
  switch (firstAggregationType) {
    case 'FINAL_EACH_DAY':
      return 'AND day_period = a1.day_period';
    case 'FINAL_EACH_WEEK':
      return 'AND week_period = a1.week_period';
    case 'FINAL_EACH_MONTH':
      return 'AND month_period = a1.month_period';
    case 'FINAL_EACH_YEAR':
      return 'AND year_period = a1.year_period';
    default:
      return '';
  }
};

const getA1Select = firstAggregationType => {
  switch (firstAggregationType) {
    case 'FINAL_EACH_DAY':
      return `SELECT ${COMMON_FIELDS}, day_period`;
    case 'FINAL_EACH_WEEK':
      return `SELECT ${COMMON_FIELDS}, week_period`;
    case 'FINAL_EACH_MONTH':
      return `SELECT ${COMMON_FIELDS}, month_period`;
    case 'FINAL_EACH_YEAR':
      return `SELECT ${COMMON_FIELDS}, year_period`;
    case 'MOST_RECENT':
      return `SELECT ${COMMON_FIELDS}`;
    default:
      return `SELECT ${COMMON_FIELDS}, ${ANSWER_SPECIFIC_FIELDS}`;
  }
};

const getA2Join = firstAggregationType => {
  return SUPPORTED_AGGREGATIONS.includes(firstAggregationType)
    ? `CROSS JOIN LATERAL (
      SELECT ${ANSWER_SPECIFIC_FIELDS}
      FROM analytics
      WHERE entity_code = a1.entity_code
      AND data_element_code = a1.data_element_code
      ${getA2FinalWhereClause(firstAggregationType)}
      order by date desc
      limit 1
    ) as a2`
    : '';
};

const generateBaseSqlQuery = ({
  dataElementCodes,
  organisationUnitCodes,
  surveyCode,
  eventId,
  startDate,
  endDate,
  aggregations,
}) => {
  const firstAggregationType = aggregations && aggregations[0] && aggregations[0].type;
  const sqlQuery = new SqlQuery(
    `
    SELECT 
      date AS "date",
      entity_code AS "entityCode",
      entity_name AS "entityName",
      data_element_code AS "dataElementCode",
      event_id AS "eventId",
      value AS "value",
      answer_type AS "type"
    FROM (
      ${getA1Select(firstAggregationType)}
      FROM analytics
      INNER JOIN (
        ${SqlQuery.parameteriseValues(dataElementCodes)}
      ) data_element_codes(code) ON data_element_codes.code = analytics.data_element_code
      INNER JOIN (
        ${SqlQuery.parameteriseValues(organisationUnitCodes)}
      ) entity_codes(code) ON entity_codes.code = analytics.entity_code
        ${getA1WhereClause({ surveyCode, eventId, startDate, endDate })}
        ${getA1GroupByClause(firstAggregationType)}
    ) as a1
    ${getA2Join(firstAggregationType)}
  `,
    [...dataElementCodes, ...organisationUnitCodes]
      .concat(surveyCode ? [surveyCode] : [])
      .concat(eventId ? [eventId] : [])
      .concat(startDate ? [utcMoment(startDate).startOf('day').toISOString()] : [])
      .concat(endDate ? [utcMoment(endDate).startOf('day').toISOString()] : []),
  );

  sqlQuery.addOrderByClause('date');

  return sqlQuery;
};

export async function fetchData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  return sqlQuery.executeOnDatabase(database);
}
