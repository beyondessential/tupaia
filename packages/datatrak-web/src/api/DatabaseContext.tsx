import React, { createContext, useState, useEffect } from 'react';

import { DatatrakWebUserRequest } from '@tupaia/types';
import { LoadingScreen } from '@tupaia/ui-components';

import { createDatabase } from '../database/createDatabase';
import { DatatrakWebModelRegistry } from '../types';

export type DatabaseContextType = DatatrakWebUserRequest.ResBody & {
  models: DatatrakWebModelRegistry;
};

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [models, setModels] = useState<DatatrakWebModelRegistry | null>(null);

  useEffect(() => {
    const init = async () => {
      const { models } = await createDatabase();
      setModels(models);
    };

    init();
  }, []);

  if (!models) {
    return <LoadingScreen />;
  }

  return <DatabaseContext.Provider value={{ models }}>{children}</DatabaseContext.Provider>;
};
