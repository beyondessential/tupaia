import { useContext } from 'react';
import { DatabaseContext, DatabaseContextType } from '../../api';

export const useDatabaseContext = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }

  return context;
};
