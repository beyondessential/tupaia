import log from 'winston';
import type { BaseDatabase } from '@tupaia/database';

/**
 * Find the last successful synced projects for a device
 * from the last successful sync session of the device (completed with no errors)
 */
export const findLastSuccessfulSyncedProjects = async (
  database: BaseDatabase,
  deviceId: string,
): Promise<string[]> => {
  const [lastSuccessfulSyncedProjectResult] = await database.executeSql<
    { last_synced_projects: string }[]
  >(
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
  );
  try {
    const parsed = JSON.parse(lastSuccessfulSyncedProjectResult?.last_synced_projects);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    log.warn('Error parsing last successful synced projects', error);
    // ignore error, it could be because it could not be found due to this is the initial sync of the device
  }
  return [];
};
