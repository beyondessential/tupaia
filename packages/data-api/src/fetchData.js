/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { utcMoment } from '@tupaia/utils';

import { SqlQuery } from './SqlQuery';

const fetchIdsFromCodes = async (database, tableName, codes) => {
  const records = await database.find(tableName, { code: codes }, { columns: ['id'] });
  return records.map(r => r.id);
};

const generateBaseSqlQuery = async (
  database,
  { dataElementCodes, organisationUnitCodes, startDate, endDate },
) => {
  const questionIds = await fetchIdsFromCodes(database, 'question', dataElementCodes);
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
      question_id IN ${SqlQuery.parameteriseArray(questionIds)}
    AND
      entity.code IN ${SqlQuery.parameteriseArray(organisationUnitCodes)}
  `,
    [...questionIds, ...organisationUnitCodes],
  );

  // Add start and end date, which are inclusive
  if (startDate) {
    sqlQuery.addClause(`AND survey_response.submission_time >= ?`, [
      utcMoment(startDate).startOf('day').toISOString(),
    ]);
  }
  if (endDate) {
    sqlQuery.addClause(`AND survey_response.submission_time <= ?`, [
      utcMoment(endDate).endOf('day').toISOString(),
    ]);
  }

  sqlQuery.orderBy('survey_response.submission_time');

  sqlQuery.logQuery();

  return sqlQuery;
};

export async function fetchEventData(database, options) {
  const sqlQuery = await generateBaseSqlQuery(database, options);
  const { surveyCode, eventId } = options;
  sqlQuery.addClause(`AND survey.code = ?`, [surveyCode]);
  if (eventId) {
    sqlQuery.addClause(`AND survey_response.id = ?`, [eventId]);
  }
  return sqlQuery.executeOnDatabase(database);
}

export async function fetchAnalyticData(database, options) {
  const sqlQuery = await generateBaseSqlQuery(database, options);
  return sqlQuery.executeOnDatabase(database);
}
