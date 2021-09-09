/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

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
];
const INTERNAL_EMAIL = '@beyondessential.com.au';

/**
 * Gets a leaderboard of coconuts and pigs based on the number of survey responses from each user
 *
 * @returns array
 * [
 *   { user_id,
 *     first_name,
 *     last_name,
 *     coconuts,
 *     pigs,
 *   },...
 * ]
 */
export const getLeaderboard = async (models, rowCount = 10) => {
  return models.database.executeSql(
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
