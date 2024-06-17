/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const USERS_EXCLUDED_FROM_LEADER_BOARD = [
  "'edmofro@gmail.com'", // Edwin
  "'kahlinda.mahoney@gmail.com'", // Kahlinda
  "'lparish1980@gmail.com'", // Lewis
  "'sus.lake@gmail.com'", // Susie
  "'michaelnunan@hotmail.com'", // Michael
  "'vanbeekandrew@gmail.com'", // Andrew
  "'gerardckelly@gmail.com'", // Gerry K
  "'geoffreyfisher@hotmail.com'", // Geoff F
  "'josh@sussol.net'", // mSupply API Client
  "'unicef.laos.edu@gmail.com'", // Laos Schools Data Collector
  "'tamanu-server@tupaia.org'", // Tamanu Server
  "'public@tupaia.org'", // Public User
];
const INTERNAL_EMAIL = ['@beyondessential.com.au', '@bes.au'];

export class SurveyResponseRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE;
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  get DatabaseRecordClass() {
    return SurveyResponseRecord;
  }

  async getLeaderboard(projectId = '', rowCount = 10) {
    const bindings = projectId ? [projectId, rowCount] : [rowCount];
    return this.database.executeSql(
      `SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
        FROM (
          SELECT user_id, COUNT(*)::int as coconuts, FLOOR(COUNT(*) / 100) as pigs
          --              ^~~~~~~~~~~~~~~ The COUNT(*)::int is required here, since pg serializes count to string
          FROM survey_response
          ${projectId ? 'JOIN survey on survey.id = survey_id and survey.project_id = ?' : ''}
          GROUP BY user_id
        ) r
        JOIN user_account on user_account.id = r.user_id
        WHERE ${INTERNAL_EMAIL.map(email => `email NOT LIKE '%${email}'`).join(' AND ')}
        AND email NOT IN (${USERS_EXCLUDED_FROM_LEADER_BOARD.join(',')})
        ORDER BY coconuts DESC
        LIMIT ?;
      `,
      bindings,
    );
  }

  async getRewardsForUser(userId, projectId = '') {
    const [rewards] = await this.database.executeSql(
      `SELECT user_id, COUNT(*)::int as coconuts, FLOOR(COUNT(*) / 100) as pigs
      --               ^~~~~~~~~~~~~~~ The COUNT(*)::int is required here, since pg serializes count to string
      FROM survey_response
      -- If there is no projectId specified, return all survey_responses. eg. on meditrak-app     
      ${projectId ? 'JOIN survey ON survey.id = survey_id AND survey.project_id = ?' : ''}
      WHERE user_id = ?
      GROUP BY user_id;
      `,
      // Need to make sure the number of replacements matches the number of ? in the query
      projectId ? [userId, projectId] : [userId],
    );

    if (rewards) {
      const { coconuts, pigs } = rewards;
      return { coconuts, pigs };
    }

    return { coconuts: 0, pigs: 0 };
  }
}
