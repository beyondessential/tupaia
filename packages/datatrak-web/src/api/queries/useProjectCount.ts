import { useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';

export const useProjectCount = () => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<number>(['projectCount'], async ({ models }) => {
    return await models.project.count();

  }, {
    enabled: isOfflineFirst,
  });
};
