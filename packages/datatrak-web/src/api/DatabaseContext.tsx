import React, { createContext, useEffect, useState } from 'react';

import { Link } from '@mui/material';
import log from 'winston';

import { FullPageLoader } from '@tupaia/ui-components';

import { createDatabase } from '../database/createDatabase';
import { DatatrakWebModelRegistry } from '../types';

export interface DatabaseContextType {
  models: DatatrakWebModelRegistry;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [models, setModels] = useState<DatatrakWebModelRegistry | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let modelsInstance: DatatrakWebModelRegistry | null = null;
    const init = async () => {
      try {
        const { models } = await createDatabase();
        modelsInstance = models;
        setModels(models);
      } catch (error) {
        log.error('DatabaseProvider.init failed to start the local database', { error });
        setError(true);
      }
    };

    init();

    return () => {
      modelsInstance?.closeDatabaseConnections();
    };
  }, []);

  if (error) {
    return (
      <FullPageLoader
        message={
          <span>
            DataTrak couldn’t start up.{' '}
            <Link component="button" type="button" onClick={() => window.location.reload()}>
              Reload
            </Link>{' '}
            to try again.
          </span>
        }
      />
    );
  }

  if (!models) {
    return <FullPageLoader message="Starting DataTrak…" />;
  }

  return <DatabaseContext.Provider value={{ models }}>{children}</DatabaseContext.Provider>;
};
