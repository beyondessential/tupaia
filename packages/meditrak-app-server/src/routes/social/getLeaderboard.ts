/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { MeditrakAppServerModelRegistry } from '../../types';

const EXCLUDED_USERS = [
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
const INTERNAL_EMAIL = '@beyondessential.com.au';

type LeaderboardItem = {
  user_id: string;
  first_name: string;
  last_name: string;
  coconuts: number;
  pigs: number;
};

/**
 * Gets a leaderboard of coconuts and pigs based on the number of survey responses from each user
 */
export const getLeaderboard = async (models: MeditrakAppServerModelRegistry, rowCount = 10) => {
  return models.database.executeSql<LeaderboardItem[]>(
    `
          SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
          FROM (
            SELECT user_id, COUNT(*) as coconuts, FLOOR(COUNT(*) / 100) as pigs
            FROM survey_response
            GROUP BY user_id
          ) r
          JOIN user_account on user_account.id = r.user_id
          WHERE email NOT LIKE '%${INTERNAL_EMAIL}'
          AND email NOT IN (${EXCLUDED_USERS.join(',')})
          ORDER BY coconuts DESC
          LIMIT ?;
        `,
    [rowCount],
  );
};
