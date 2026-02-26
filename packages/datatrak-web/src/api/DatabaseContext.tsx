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
      modelsInstance?.closeDatabaseConnections().catch((err: unknown) => {
        // Graceful recovery: avoid unhandled rejection when closing mid-sync or in environments
        // (e.g. browser) where connection pool cleanup may fail (e.g. timeout.close is not a function)
        console.warn('Database cleanup on unmount:', err);
      });
    };
  }, []);

  if (!models) {
    return <FullPageLoader message="Starting DataTrak…" />;
  }

  return <DatabaseContext.Provider value={{ models }}>{children}</DatabaseContext.Provider>;
};
