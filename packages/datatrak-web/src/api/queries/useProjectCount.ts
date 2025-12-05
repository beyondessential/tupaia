import { useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';

export const useProjectCount = () => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<number>(['projectCount'], ({ models }) => models.project.count(), {
    enabled: isOfflineFirst,
  });
};
