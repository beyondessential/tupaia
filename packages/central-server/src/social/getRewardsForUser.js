/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const getRewardsForUser = async (database, userId, projectId = '') => {
  const [rewards] = await database.executeSql(
    `SELECT user_id, COUNT(*) as coconuts, FLOOR(COUNT(*) / 100) as pigs
    FROM survey_response
    JOIN survey on survey.id=survey_id
    WHERE user_id = ?
    ${projectId ? 'AND project_id = ?' : ''}
    GROUP BY user_id;
    `,
    [userId, projectId],
  );

  if (rewards) {
    const { coconuts, pigs } = rewards;
    return { coconuts, pigs };
  }

  return { coconuts: 0, pigs: 0 };
};
