/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { utcMoment } from '@tupaia/utils';

import { SqlQuery } from './SqlQuery';

const generateBaseSqlQuery = ({ dataElementCodes, organisationUnitCodes, startDate, endDate }) => {
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
    WHERE
      data_element_code IN ${SqlQuery.parameteriseArray(dataElementCodes)}
    AND
      entity_code IN ${SqlQuery.parameteriseArray(organisationUnitCodes)}
  `,
    [...dataElementCodes, ...organisationUnitCodes],
  );

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addClause(`AND date >= ?`, [utcMoment(startDate).startOf('day').toISOString()]);
  }
  if (endDate) {
    sqlQuery.addClause(`AND date <= ?`, [utcMoment(endDate).endOf('day').toISOString()]);
  }

  sqlQuery.orderBy('date');

  sqlQuery.logQuery();

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
  return sqlQuery.executeOnDatabase(database);
}
