import React, { createContext, useEffect, useState } from 'react';

import { FullPageLoader } from '@tupaia/ui-components';

import { createDatabase } from '../database/createDatabase';
import { DatatrakWebModelRegistry } from '../types';

export interface DatabaseContextType {
  models: DatatrakWebModelRegistry;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [models, setModels] = useState<DatatrakWebModelRegistry | null>(null);

  useEffect(() => {
    let modelsInstance: DatatrakWebModelRegistry | null = null;
    const init = async () => {
      const { models } = await createDatabase();
      modelsInstance = models;
      setModels(models);
    };

    init();

    return () => {
      modelsInstance?.closeDatabaseConnections();
    };
  }, []);

  if (!models) {
    return <FullPageLoader />;
  }

  return <DatabaseContext.Provider value={{ models }}>{children}</DatabaseContext.Provider>;
};
