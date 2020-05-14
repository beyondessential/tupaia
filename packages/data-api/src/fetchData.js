/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from './SqlQuery';
import { parameteriseArray } from './utils';

const generateBaseSqlQuery = ({ dataElementCodes, organisationUnitCodes, startDate, endDate }) => {
  const sqlQuery = new SqlQuery(
    `
    SELECT
      survey_response.id as "surveyResponseId",
      survey_response.submission_time as "date",
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
      question.code IN ${parameteriseArray(dataElementCodes)}
    AND
      entity.code IN ${parameteriseArray(organisationUnitCodes)}
  `,
    [...dataElementCodes, ...organisationUnitCodes],
  );

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addClause(`AND survey_response.submission_time >= ?`, [startDate]);
  }
  if (endDate) {
    sqlQuery.addClause(`AND survey_response.submission_time <= ?`, [endDate]);
  }

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
