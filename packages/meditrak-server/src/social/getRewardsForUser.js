/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const getRewardsForUser = async (database, userId) => {
  const [{ coconuts, pigs }] = await database.executeSql(
    `
    SELECT user_id, COUNT(*) as coconuts, FLOOR(COUNT(*) / 100) as pigs
    FROM survey_response
    WHERE user_id = ?
    GROUP BY user_id;
    `,
    userId,
  );
  return { coconuts, pigs };
};
