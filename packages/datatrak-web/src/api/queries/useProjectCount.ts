import { useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';

export const useProjectCount = () => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<number>(['projectCount'], async ({ models }) => { 
    console.log('[useProjectCount] Query executing', {
      timestamp: new Date().toISOString(),
      hasModels: !!models,
      hasProjectModel: !!models?.project,
      projectModelHasDatabase: !!models?.project?.database,
      projectDatabaseType: models?.project?.database?.constructor?.name,
    });
    
    try {
      const result = await models.project.count();
      console.log('[useProjectCount] Query succeeded', { result });
      return result;
    } catch (error: any) {
      console.error('[useProjectCount] Query failed', {
        errorMessage: error?.message,
        errorStack: error?.stack,
        modelState: {
          hasModels: !!models,
          hasProjectModel: !!models?.project,
          projectModelHasDatabase: !!models?.project?.database,
          projectDatabaseKeys: models?.project?.database ? Object.keys(models.project.database) : [],
        },
      });
      throw error;
    }
  }, {
    enabled: isOfflineFirst,
  });
};
