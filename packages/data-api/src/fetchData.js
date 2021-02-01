/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { utcMoment } from '@tupaia/utils';

import { SqlQuery } from './SqlQuery';

const generateBaseSqlQuery = ({
  dataElementCodes,
  organisationUnitCodes,
  startDate,
  endDate,
  aggregations,
}) => {
  const sqlQuery = new SqlQuery(
    `
    SELECT
      survey_response_id as "surveyResponseId",
      date,
      entity_code as "entityCode",
      entity_name as "entityName",
      data_element_code as "dataElementCode",
      type,
      value
    FROM
      analytics
    INNER JOIN (
      ${SqlQuery.parameteriseValues(dataElementCodes)}
    ) decs(dec) ON data_element_code = dec
    INNER JOIN (
      ${SqlQuery.parameteriseValues(organisationUnitCodes)}
    ) ecs(ec) ON entity_code = ec
  `,
    [...dataElementCodes, ...organisationUnitCodes],
  );

  // Perform fetch side aggregations if possible
  const firstAggregation = aggregations && aggregations[0];
  if (firstAggregation && firstAggregation.type === 'FINAL_EACH_DAY') {
    sqlQuery.addWhereClause(`final_per_day = ?`, [true]);
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_WEEK') {
    sqlQuery.addWhereClause(`final_per_week = ?`, [true]);
  }
  if (firstAggregation && firstAggregation.type === 'FINAL_EACH_MONTH') {
    sqlQuery.addWhereClause(`final_per_month = ?`, [true]);
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_YEAR') {
    sqlQuery.addWhereClause(`final_per_year = ?`, [true]);
  }

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addWhereClause(`date >= ?`, [utcMoment(startDate).startOf('day').toISOString()]);
  }
  if (endDate) {
    sqlQuery.addWhereClause(`date <= ?`, [utcMoment(endDate).endOf('day').toISOString()]);
  }

  sqlQuery.addOrderByClause('date');

  if (firstAggregation && firstAggregation.type === 'MOST_RECENT') {
    sqlQuery.wrapAs(
      'valid_analytics ("surveyResponseId", date, "entityCode", "entityName", "dataElementCode", type, value)',
    );
    sqlQuery.addSelectClause(`
      SELECT 
        a.*
      FROM
        valid_analytics a
      LEFT JOIN
        valid_analytics b
        ON
          a."entityCode" = b."entityCode"
        AND
          a."dataElementCode" = b."dataElementCode"
        AND
          a.date < b.date
      WHERE
        b.date IS NULL`);
  }
  return sqlQuery;
};

export async function fetchEventData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  const { surveyCode, eventId } = options;
  sqlQuery.addWhereClause(`survey.code = ?`, [surveyCode]);
  if (eventId) {
    sqlQuery.addWhereClause(`survey_response.id = ?`, [eventId]);
  }
  return sqlQuery.executeOnDatabase(database);
}

export async function fetchAnalyticData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  const results = sqlQuery.executeOnDatabase(database);

  return results;
}
