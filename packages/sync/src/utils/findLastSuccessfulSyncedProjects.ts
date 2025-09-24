import type { BaseDatabase } from '@tupaia/database';

// wait for any locks using the current sync clock tick as the id - these locks are also
// taken during create/update triggers on synced tables, so this ensures that any pending
// transactions that involve a create/update of a record have finished
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
