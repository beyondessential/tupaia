import React, { createContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { FullPageLoader } from '@tupaia/ui-components';

import { ErrorDisplay } from '../components';
import { createDatabase, DatabaseStartupStage } from '../database/createDatabase';
import { DatatrakWebModelRegistry } from '../types';

export interface DatabaseContextType {
  models: DatatrakWebModelRegistry;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

const STAGE_MESSAGES: Record<DatabaseStartupStage, string> = {
  connecting: 'Starting DataTrak…',
  migrating: 'Setting up your device’s database…',
};

const Details = styled.pre`
  overflow-x: auto;
  max-height: 15rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background: ${({ theme }) => theme.palette.grey['100']};
  font-size: 0.75rem;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

/**
 * Elapsed time, so that a start which is merely slow is visibly distinguishable from one which has
 * stalled. Users can read this number out when reporting a problem.
 */
const ElapsedSeconds = () => {
  const startedAt = useRef(Date.now());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  // Stay quiet for the first few seconds; a normal start shouldn’t look like it’s struggling
  if (seconds < 10) return null;

  return <> ({seconds}s)</>;
};

export const DatabaseProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [models, setModels] = useState<DatatrakWebModelRegistry | null>(null);
  const [stage, setStage] = useState<DatabaseStartupStage>('connecting');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let modelsInstance: DatatrakWebModelRegistry | null = null;
    let cancelled = false;

    const init = async () => {
      try {
        const { models } = await createDatabase(nextStage => {
          if (!cancelled) setStage(nextStage);
        });

        if (cancelled) {
          // Unmounted mid-startup, so nothing will close this for us
          void models.closeDatabaseConnections();
          return;
        }

        modelsInstance = models;
        setModels(models);
      } catch (caught) {
        // Without this the rejection goes unhandled and the loader spins forever, which on a
        // low-spec device is indistinguishable from a start that is merely slow
        if (!cancelled) setError(caught instanceof Error ? caught : new Error(String(caught)));
      }
    };

    void init();

    return () => {
      cancelled = true;
      void modelsInstance?.closeDatabaseConnections();
    };
  }, []);

  if (error) {
    return (
      <ErrorDisplay title="DataTrak couldn’t start" errorMessage={error.message}>
        <Details>{error.stack ?? error.message}</Details>
      </ErrorDisplay>
    );
  }

  if (!models) {
    return (
      <FullPageLoader
        message={
          <>
            {STAGE_MESSAGES[stage]}
            <ElapsedSeconds />
          </>
        }
      />
    );
  }

  return <DatabaseContext.Provider value={{ models }}>{children}</DatabaseContext.Provider>;
};
