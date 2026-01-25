import { useDatabaseQuery } from './useDatabaseQuery';
import { useIsOfflineFirst } from '../offlineFirst';

export const useProjectCount = () => {
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseQuery<number>(['projectCount'], ({ models }) => { 
    console.log('models', models.project);
    console.log('models.project', models.project);
    return models.project.count();
  }, {
    enabled: isOfflineFirst,
  });
};
