/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from './SqlQuery';

const generateBaseSqlQuery = ({ dataElementCodes, startDate, endDate }) => {
  const sqlQuery = new SqlQuery(
    `
    SELECT
      survey_response.id as "surveyResponseId",
      survey_response.submission_time as "date"
      entity.code as "entityCode",
      entity.name as "entityName",
      question.code as "dataElementCode",
      answer.text as "value",
    FROM
      survey_response sr
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
  `,
    dataElementCodes,
  );

  if (startDate) {
    sqlQuery.addClause(`AND survey_response.submission_time >= ?`, [startDate]); // TODO check if dhis2 is inclusive or exclusive
  }
  if (endDate) {
    sqlQuery.addClause(`AND survey_response.submission_time <= ?`, [endDate]);
  }

  return sqlQuery;
};

export async function fetchEventData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  const { surveyCode, organisationUnitCode, eventId } = options;
  sqlQuery.addClause(`AND survey.code = ?`, [surveyCode]);
  sqlQuery.addClause(`AND entity.code = ?`, [organisationUnitCode]);
  if (eventId) {
    sqlQuery.addClause(`AND survey_response.id = ?`, [eventId]);
  }
  return sqlQuery.executeOnDatabase(database);
}

export async function fetchAnalyticData(database, options) {
  const sqlQuery = generateBaseSqlQuery(options);
  const { organisationUnitCodes } = options;
  sqlQuery.addClause(
    `AND entity.code IN ${SqlQuery.parameteriseArray(organisationUnitCodes)}`,
    organisationUnitCodes,
  );
  return sqlQuery.executeOnDatabase(database);
}
