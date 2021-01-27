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
      ${SqlQuery.parameteriseValues(organisationUnitCodes, dataElementCodes.length)}
    ) ecs(ec) ON entity_code = ec
  `,
    [...dataElementCodes, ...organisationUnitCodes],
  );

  // Perform fetch side aggregations if possible
  const firstAggregation = aggregations && aggregations[0];
  if (firstAggregation && firstAggregation.type === 'FINAL_EACH_DAY') {
    sqlQuery.addClause(`AND final_per_day = $${sqlQuery.parameters.length + 1}`, [true]);
    aggregations.shift();
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_WEEK') {
    sqlQuery.addClause(`AND final_per_week = $${sqlQuery.parameters.length + 1}`, [true]);
    aggregations.shift();
  } else if (firstAggregation && firstAggregation.type === 'FINAL_EACH_MONTH') {
    sqlQuery.addClause(`AND final_per_month = $${sqlQuery.parameters.length + 1}`, [true]);
    aggregations.shift();
  }

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addClause(`AND date >= $${sqlQuery.parameters.length + 1}`, [
      utcMoment(startDate).startOf('day').toISOString(),
    ]);
  }
  if (endDate) {
    sqlQuery.addClause(`AND date <= $${sqlQuery.parameters.length + 1}`, [
      utcMoment(endDate).endOf('day').toISOString(),
    ]);
  }

  sqlQuery.orderBy('date');

  return sqlQuery;
};

export async function fetchEventData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  const { surveyCode, eventId } = options;
  sqlQuery.addClause(`AND survey.code = ?`, [surveyCode]);
  if (eventId) {
    sqlQuery.addClause(`AND survey_response.id = ?`, [eventId]);
  }
  return sqlQuery.executeOnDatabase(database);
}

export async function fetchAnalyticData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  return sqlQuery.executeOnDatabaseViaPgClient(database);
}
