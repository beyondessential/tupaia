import type { BaseDatabase } from '@tupaia/database';

export const findLastSuccessfulSyncedProjects = async (
  database: BaseDatabase,
  deviceId: string,
): Promise<string[]> => {
  const [lastSuccessfulSyncedProjectResult] = (await database.executeSql(
    `
      SELECT info->>'projectIds' as last_synced_projects
      FROM sync_session 
      WHERE info->>'deviceId' = ?
      AND completed_at IS NOT NULL 
      AND errors IS NULL
      ORDER BY completed_at DESC 
      LIMIT 1;
    `,
    [deviceId],
  )) as { last_synced_projects: string }[];
  let lastSuccessfulSyncedProjectIds = [];
  try {
    lastSuccessfulSyncedProjectIds = JSON.parse(
      lastSuccessfulSyncedProjectResult?.last_synced_projects,
    );
  } catch (error) {
    console.error('Error parsing last successful synced projects', error);
  }
  return lastSuccessfulSyncedProjectIds;
};
