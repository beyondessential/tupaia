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

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addClause(`AND survey_response.data_time >= ?`, [
      utcMoment(startDate).startOf('day').toISOString(),
    ]);
  }
  if (endDate) {
    sqlQuery.addClause(`AND survey_response.data_time <= ?`, [
      utcMoment(endDate).endOf('day').toISOString(),
    ]);
  }

  sqlQuery.orderBy('survey_response.data_time');

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
