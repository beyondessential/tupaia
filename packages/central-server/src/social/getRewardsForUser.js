/**
 * @privateRemarks There’s no technical limitation preventing us from getting the user’s rank for
 * all projects in {@link getRewardsForAllProjects}, but the SELECT is expensive on large relations.
 * Filtering for one project, this takes a few milliseconds; but to calculate rankings for all
 * projects takes several minutes.
 */
const getRewardsForProject = async (database, userId, projectId) => {
  const [rewards] = await database.executeSql(
    `
      SELECT response_count::int              AS coconuts,
             FLOOR(response_count / 100)::int AS pigs,
             rank
      FROM   (
        SELECT   user_id,
                 COUNT(*)                             AS response_count,
                 RANK() OVER (ORDER BY COUNT(*) DESC) AS rank
        FROM     survey_response JOIN survey ON survey.id = survey_id
        WHERE    project_id = ?
        GROUP BY user_id
      ) AS user_stats
      WHERE  user_id = ?;`,
    [projectId, userId],
  );

  return rewards ?? { coconuts: 0, pigs: 0, rank: null };
};

const getRewardsForAllProjects = async (database, userId) => {
  const [rewards] = await database.executeSql(
    `
      SELECT   COUNT(*)::int AS coconuts, FLOOR(COUNT(*) / 100)::int AS pigs
      FROM     survey_response JOIN survey ON survey.id = survey_id
      WHERE    user_id = ?
      GROUP BY user_id;`,
    [userId],
  );

  return rewards ?? { coconuts: 0, pigs: 0 };
};

export const getRewardsForUser = async (database, userId, projectId) => {
  if (projectId) {
    return await getRewardsForProject(database, userId, projectId);
  }

  // If no projectId specified, return data from all survey responses (e.g. in MediTrak)
  return await getRewardsForAllProjects(database, userId);
};
