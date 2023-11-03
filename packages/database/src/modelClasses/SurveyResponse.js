/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

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
];
const INTERNAL_EMAIL = ['@beyondessential.com.au', '@bes.au'];

export class SurveyResponseType extends DatabaseType {
  static databaseType = TYPES.SURVEY_RESPONSE;
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return SurveyResponseType;
  }

  async getLeaderboard(rowCount = 10) {
    return this.database.executeSql(
      ` SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
        FROM (
          SELECT user_id, COUNT(*) as coconuts, FLOOR(COUNT(*) / 100) as pigs
          FROM survey_response
          GROUP BY user_id
        ) r
        JOIN user_account on user_account.id = r.user_id
        WHERE ${INTERNAL_EMAIL.map(email => `email NOT LIKE '%${email}'`).join(' AND ')}
        AND email NOT IN (${EXCLUDED_USERS.join(',')})
        ORDER BY coconuts DESC
        LIMIT ?;
      `,
      [rowCount],
    );
  }
}
