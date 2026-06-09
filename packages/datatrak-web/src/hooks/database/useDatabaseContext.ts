import { useContext } from 'react';
import { DatabaseContext, DatabaseContextType } from '../../api';
import { useIsOfflineFirst } from '../../api/offlineFirst';

export const useDatabaseContext = (): DatabaseContextType | null => {
  const context = useContext(DatabaseContext);
  const isOfflineFirst = useIsOfflineFirst();

  if (!context && isOfflineFirst) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }

  return context;
};
