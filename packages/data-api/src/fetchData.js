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
  const sqlQuery = new SqlQuery(`
    SELECT
      survey_response.submission_time as "date",
      entity_code as "entityCode",
      data_element_code as "dataElementCode",
      answer.type as "type",
      answer.text as "value"
  `);

  // Perform fetch side aggregations if possible
  const firstAggregation = aggregations && aggregations[0];
  if (firstAggregation && firstAggregation.type === 'FINAL_EACH_DAY') {
    sqlQuery.addClause(`
    FROM
      aggregate_analytics_day`);
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_WEEK') {
    sqlQuery.addClause(`
    FROM
      aggregate_analytics_week`);
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_MONTH') {
    sqlQuery.addClause(`
    FROM
      aggregate_analytics_month`);
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_YEAR') {
    sqlQuery.addClause(`
    FROM
      aggregate_analytics_year`);
  } else if (firstAggregation && firstAggregation.type === 'MOST_RECENT') {
    sqlQuery.addClause(`
    FROM
      aggregate_analytics_all_time`);
  } else {
    sqlQuery.addClause(`
    FROM
      aggregate_analytics_day`);
  }
  sqlQuery.addClause(`
    INNER JOIN answer
      ON answer.id = most_recent_answer_id
    INNER JOIN survey_response
      ON answer.survey_response_id = survey_response.id`);

  sqlQuery.addClause(
    `
    INNER JOIN (
      ${SqlQuery.parameteriseValues(dataElementCodes)}
    ) decs(dec) ON data_element_code = dec
    INNER JOIN (
      ${SqlQuery.parameteriseValues(organisationUnitCodes)}
    ) ecs(ec) ON entity_code = ec
   `,
    [...dataElementCodes, ...organisationUnitCodes],
  );

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addWhereClause(`survey_response.submission_time >= ?`, [
      utcMoment(startDate).startOf('day').toISOString(),
    ]);
  }
  if (endDate) {
    sqlQuery.addWhereClause(`survey_response.submission_time <= ?`, [
      utcMoment(endDate).endOf('day').toISOString(),
    ]);
  }

  sqlQuery.addOrderByClause('date');

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
