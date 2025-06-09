import React, { createContext, useContext, useState, useEffect } from 'react';

import { DatatrakWebUserRequest } from '@tupaia/types';

import { createDatabase } from '../database/createDatabase';
import { DatatrakWebModelRegistry } from '../types/model';

export type DatabaseContextType = DatatrakWebUserRequest.ResBody & {
  models: DatatrakWebModelRegistry | null;
};

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [models, setModels] = useState<DatatrakWebModelRegistry | null>(null);

  useEffect(() => {
    const init = async () => {
      // // TODO: Remove this once we have a proper way to test the database for front end in RN-1680
      if (!process.env.JEST_WORKER_ID) {
        const { models } = await createDatabase();
        setModels(models as DatatrakWebModelRegistry);
      }
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
