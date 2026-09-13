import React, { createContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { FullPageLoader } from '@tupaia/ui-components';

import { ErrorDisplay } from '../components';
import { createDatabase, DatabaseStartupStage } from '../database/createDatabase';
import {
  getStartupLog,
  startCapturingStartupLog,
  stopCapturingStartupLog,
} from '../database/startupLog';
import { DatatrakWebModelRegistry } from '../types';

export interface DatabaseContextType {
  models: DatatrakWebModelRegistry;
}

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

const STAGE_MESSAGES: Record<DatabaseStartupStage, string> = {
  connecting: 'Starting DataTrak…',
  migrating: 'Setting up your device’s database…',
};

const Monospace = styled.pre`
  overflow: auto;
  max-height: 15rem;
  margin-block: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background: ${({ theme }) => theme.palette.grey['100']};
  font-size: 0.7rem;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const Summary = styled.summary`
  cursor: pointer;
  margin-block-start: 1rem;
  font-size: 0.9rem;
`;

const CopyButton = styled.button`
  margin-block-start: 0.5rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 0.25rem;
  background: none;
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
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

const StartupFailure = ({ error }: { error: Error }) => {
  const [copied, setCopied] = useState(false);
  const report = `${error.stack ?? error.message}\n\n--- startup log ---\n${getStartupLog()}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      // Clipboard can be unavailable or refused; the log is on screen to read either way
      setCopied(false);
    }
  };

  return (
    <ErrorDisplay title="DataTrak couldn’t start" errorMessage={error.message}>
      <details>
        <Summary>Show details</Summary>
        <Monospace>{report}</Monospace>
        <CopyButton type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy details'}
        </CopyButton>
      </details>
    </ErrorDisplay>
  );
};

export const DatabaseProvider = ({ children }: { children: Readonly<React.ReactNode> }) => {
  const [models, setModels] = useState<DatatrakWebModelRegistry | null>(null);
  const [stage, setStage] = useState<DatabaseStartupStage>('connecting');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let modelsInstance: DatatrakWebModelRegistry | null = null;
    let cancelled = false;

    const init = async () => {
      startCapturingStartupLog();
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
      } finally {
        // Whatever happened, startup is over; anything already captured stays readable
        stopCapturingStartupLog();
      }
    };

    void init();

    return () => {
      cancelled = true;
      stopCapturingStartupLog();
      void modelsInstance?.closeDatabaseConnections();
    };
  }, []);

  if (error) return <StartupFailure error={error} />;

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
