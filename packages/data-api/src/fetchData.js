/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { utcMoment, stripTimezoneFromDate } from '@tupaia/utils';

import { SqlQuery } from './SqlQuery';

<<<<<<< HEAD
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

const COMMON_FIELDS = ['data_element_code', 'entity_code']; // Fields which may be grouped by for aggregation purposes
const ANSWER_SPECIFIC_FIELDS = ['entity_name', 'date', 'event_id', 'value', 'type']; // Fields unique to each answer

const getA1Select = firstAggregation => {
  return `SELECT ${COMMON_FIELDS.concat(
    firstAggregation.useA2Join ? firstAggregation.periodColumns : ANSWER_SPECIFIC_FIELDS,
  ).join(', ')}`;
};

const getA1WhereClause = (conditions, paramsArray) => {
  let hasAnyCondition = false;
  let clause = '';
  for (const [condition, value] of Object.entries(conditions)) {
    if (!value) {
      continue;
    }
    paramsArray.push(value);

    clause = `${clause}
              ${hasAnyCondition ? 'AND' : 'WHERE'}`;
    switch (condition) {
      case 'dataGroupCode':
        clause = `${clause} data_group_code = ?`;
        break;
      case 'eventId':
        clause = `${clause} event_id = ?`;
        break;
      case 'startDate':
        clause = `${clause} date >= ?`;
        break;
      case 'endDate':
        clause = `${clause} date <= ?`;
        break;
      default:
        throw new Error(`Unknown condition in fetch data where clause: ${condition}`);
    }
    hasAnyCondition = true;
  }

  return clause;
};

const getA1GroupByClause = firstAggregation => {
  return firstAggregation.useA2Join
    ? `GROUP BY ${COMMON_FIELDS.concat(firstAggregation.periodColumns).join(', ')}`
    : '';
};
=======
const generateBaseSqlQuery = ({ dataElementCodes, organisationUnitCodes, startDate, endDate }) => {
  const sqlQuery = new SqlQuery(
    `
    SELECT
      survey_response.id as "surveyResponseId",
      survey_response.data_time as "date",
      entity.code as "entityCode",
      entity.name as "entityName",
      question.code as "dataElementCode",
      question.type as "type",
      answer.text as "value"
    FROM
      survey_response
    JOIN
      answer ON answer.survey_response_id = survey_response.id
    JOIN
      entity ON entity.id = survey_response.entity_id
    JOIN
      question ON question.id = answer.question_id
    JOIN
      survey ON survey.id = survey_response.survey_id
    WHERE
      question.code IN ${SqlQuery.parameteriseArray(dataElementCodes)}
    AND
      entity.code IN ${SqlQuery.parameteriseArray(organisationUnitCodes)}
  `,
    [...dataElementCodes, ...organisationUnitCodes],
  );
>>>>>>> origin/dev

const getA2WhereClause = (firstAggregation, startDate, endDate, paramsArray) => {
  const whereClauses = COMMON_FIELDS.concat(firstAggregation.periodColumns).map(
    field => `${field} = a1.${field}`,
  );
  if (startDate) {
<<<<<<< HEAD
    whereClauses.push('date >= ?');
    paramsArray.push(startDate);
  }
  if (endDate) {
    whereClauses.push('date <= ?');
    paramsArray.push(endDate);
=======
    sqlQuery.addClause(`AND survey_response.data_time >= ?`, [
      stripTimezoneFromDate(utcMoment(startDate).startOf('day').toISOString()),
    ]);
  }
  if (endDate) {
    sqlQuery.addClause(`AND survey_response.data_time <= ?`, [
      stripTimezoneFromDate(utcMoment(endDate).endOf('day').toISOString()),
    ]);
>>>>>>> origin/dev
  }
  return `WHERE ${whereClauses.join('\n      AND ')}`;
};

const getA2Join = (firstAggregation, startDate, endDate, paramsArray) => {
  return firstAggregation.useA2Join
    ? `CROSS JOIN LATERAL (
      SELECT ${ANSWER_SPECIFIC_FIELDS}
      FROM analytics
      ${getA2WhereClause(firstAggregation, startDate, endDate, paramsArray)}
      order by date desc
      limit 1
    ) as a2`
    : '';
};

const generateBaseSqlQuery = ({
  dataElementCodes,
  organisationUnitCodes,
  dataGroupCode,
  eventId,
  startDate,
  endDate,
  aggregations,
}) => {
  const adjustedStartDate = startDate
    ? utcMoment(startDate).startOf('day').toISOString()
    : undefined;
  const adjustedEndDate = endDate ? utcMoment(endDate).endOf('day').toISOString() : undefined;
  const firstAggregation = AGGREGATIONS[aggregations?.[0]?.type] || AGGREGATIONS.DEFAULT;
  const paramsArray = [];
  const sqlQuery = new SqlQuery(
    `
    SELECT 
      date AS "date",
      entity_code AS "entityCode",
      entity_name AS "entityName",
      data_element_code AS "dataElementCode",
      event_id AS "eventId",
      value AS "value",
      type AS "type"
    FROM (
      ${getA1Select(firstAggregation)}
      FROM analytics
      INNER JOIN (
        ${SqlQuery.parameteriseValues(dataElementCodes, paramsArray)}
      ) data_element_codes(code) ON data_element_codes.code = analytics.data_element_code
      INNER JOIN (
        ${SqlQuery.parameteriseValues(organisationUnitCodes, paramsArray)}
      ) entity_codes(code) ON entity_codes.code = analytics.entity_code
        ${getA1WhereClause(
          { dataGroupCode, eventId, startDate: adjustedStartDate, endDate: adjustedEndDate },
          paramsArray,
        )}
        ${getA1GroupByClause(firstAggregation)}
    ) as a1
    ${getA2Join(firstAggregation, adjustedStartDate, adjustedEndDate, paramsArray)}
  `,
    paramsArray,
  );

<<<<<<< HEAD
  sqlQuery.addOrderByClause('date');
=======
  sqlQuery.orderBy('survey_response.data_time');
>>>>>>> origin/dev

  return sqlQuery;
};

export async function fetchData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  return sqlQuery.executeOnDatabase(database);
}
