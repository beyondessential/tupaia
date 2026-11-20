import React from 'react';
import { Fab, Tooltip } from '@material-ui/core';
import { Database, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';

import { useCurrentUserContext, useSyncContext } from '../api';
import { useIsOfflineFirst } from '../api/offlineFirst';
import {
  ContextualMutationFunctionContext,
  useDatabaseMutation,
} from '../api/queries/useDatabaseMutation';
import { simulateSaveSurveyResponses } from '../database';
import { useSyncStatus } from '../sync/syncStatus';
import { errorToast, successToast } from '../utils';

const DEFAULT_SIMULATED_RECORD_COUNT = 100;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const Container = styled.div`
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: ${({ theme }) => theme.zIndex.snackbar - 1};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 150ms;

  &:hover,
  &:focus-within {
    opacity: 1;
  }
`;

const SecondaryActions = styled.div`
  display: none;
  ${Container}:hover &, ${Container}:focus-within & {
    display: flex;
  }
`;

const SyncIcon = styled(RefreshCcw)<{ $isSpinning: boolean }>`
  animation: ${spin} 1s linear infinite;
  animation-play-state: ${({ $isSpinning }) => ($isSpinning ? 'running' : 'paused')};
`;

const useSimulateSaveSurveyResponses = () =>
  useDatabaseMutation(
    async ({ models, user, data: count }: ContextualMutationFunctionContext<number>) =>
      simulateSaveSurveyResponses({ models, user, count }),
    {
      onSuccess: ({ responseCount, answerCount, surveyCode, durationMs }) => {
        const message = `Saved ${responseCount} responses (${answerCount} answers) to ${surveyCode} in ${durationMs} ms`;
        console.info(`[simulateSaveSurveyResponses] ${message}`);
        successToast(message);
      },
      onError: (error: Error) => errorToast(`Simulation failed: ${error.message}`),
    },
  );

const FloatingSyncButtonContent = () => {
  const syncManager = useSyncContext()?.clientSyncManager;
  const queryClient = useQueryClient();
  const { isRequestingSync, isSyncing, isQueuing, progressMessage } = useSyncStatus();
  const simulate = useSimulateSaveSurveyResponses();

  const isBusy = isRequestingSync || isSyncing || isQueuing;
  const syncTooltip = isBusy ? (progressMessage ?? 'Syncing…') : 'Sync now';

  const onSync = () => {
    if (!isBusy) void syncManager?.triggerUrgentSync(queryClient);
  };

  const onSimulate = () => {
    const input = window.prompt(
      'How many survey responses should be saved? These are real records and will be pushed on the next sync.',
      String(DEFAULT_SIMULATED_RECORD_COUNT),
    );
    if (input === null) return;
    const count = Number.parseInt(input, 10);
    if (!Number.isFinite(count) || count <= 0) {
      errorToast(`Invalid number of records: ${input}`);
      return;
    }
    simulate.mutate(count);
  };

  return (
    <Container>
      <SecondaryActions>
        <Tooltip title={simulate.isLoading ? 'Saving…' : 'Simulate saving records'} placement="left">
          <span>
            <Fab
              size="small"
              onClick={onSimulate}
              disabled={simulate.isLoading}
              aria-label="Simulate saving records"
            >
              <Database size={18} />
            </Fab>
          </span>
        </Tooltip>
      </SecondaryActions>
      <Tooltip title={syncTooltip} placement="left">
        <Fab color="primary" onClick={onSync} aria-label="Sync now">
          <SyncIcon $isSpinning={isBusy} size={24} />
        </Fab>
      </Tooltip>
    </Container>
  );
};

/**
 * Floating button available on every page that manually triggers a sync. Hovering it reveals a
 * secondary action for simulating bulk record saves (performance testing).
 */
export const FloatingSyncButton = () => {
  const isOfflineFirst = useIsOfflineFirst();
  const { isLoggedIn } = useCurrentUserContext();
  if (!isOfflineFirst || !isLoggedIn) return null;
  return <FloatingSyncButtonContent />;
};
