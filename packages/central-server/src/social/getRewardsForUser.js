export const getRewardsForUser = async (database, userId, projectId = '') => {
  const [rewards] = await database.executeSql(
    `SELECT user_id, COUNT(*) as coconuts, FLOOR(COUNT(*) / 100) as pigs
    FROM survey_response
    JOIN survey on survey.id=survey_id
    WHERE user_id = ?
    -- If there is no projectId specified, return all survey_responses. eg. on meditrak-app     
     ${projectId ? 'AND project_id = ?' : ''}
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
};
