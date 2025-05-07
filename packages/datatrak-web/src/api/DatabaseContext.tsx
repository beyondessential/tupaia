import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatatrakWebUserRequest } from '@tupaia/types';
import { ModelRegistry } from '@tupaia/database';
import { createDatabase } from '../database/createDatabase';

export type DatabaseContextType = DatatrakWebUserRequest.ResBody & { models: ModelRegistry | null };

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [models, setModels] = useState<ModelRegistry | null>(null);

  useEffect(() => {
    const init = async () => {
      const { models } = await createDatabase();
      setModels(models);
    };

    init();
  }, []);

  return <DatabaseContext.Provider value={{ models }}>{children}</DatabaseContext.Provider>;
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  
  return context;
};
