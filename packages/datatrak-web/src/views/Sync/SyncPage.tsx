import { useQueryClient } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { ensure } from '@tupaia/tsutils';
import { useSyncContext } from '../../api/SyncContext';
import { Button } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { SYNC_EVENT_ACTIONS } from '../../types';
import { useIsMobile } from '../../utils';
import { LastSyncDate } from './LastSyncDate';
import { SyncStatus } from './SyncStatus';

const Wrapper = styled.div`
  block-size: 100dvb;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const LayoutManager = styled.div`
  display: grid;
  grid-row-start: 2;
  grid-template-areas: '.' '--content' '.';
  grid-template-rows: minmax(0, 2fr) auto minmax(0, 3fr);
`;

const ErrorMessage = styled.p`
  margin-block-start: 10rem;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  grid-area: --content;
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1rem);
  padding-left: max(env(safe-area-inset-left, 0), 1.5rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.5rem);
  padding-top: 1rem;
  text-align: center;

  > * {
    max-inline-size: min(100%, 20rem);
  }
`;

const StyledSyncStatus = styled(SyncStatus)`
  margin-block-start: 1rem;
  font-variant-numeric: lining-nums tabular-nums;
`;

const StyledLastSyncDate = styled(LastSyncDate)`
  margin-block-start: 2.25rem;
`;

const StyledButton = styled(Button)`
  margin-block-start: 2.25rem;
`;

export function formatlastSuccessfulSyncTime(lastSuccessfulSyncTime: Date | null): string {
  const formattedTimeString = lastSuccessfulSyncTime
    ? formatDistance(lastSuccessfulSyncTime, new Date(), { addSuffix: true })
    : '';

  // Capitalize the first letter
  return formattedTimeString.length > 0
    ? formattedTimeString.charAt(0).toUpperCase() + formattedTimeString.slice(1)
    : formattedTimeString;
}

export const SyncPage = () => {
  const { clientSyncManager } = useSyncContext() || {};
  const syncManager = ensure(clientSyncManager);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [syncStarted, setSyncStarted] = useState<boolean>(syncManager.isSyncing);
  const [errorMessage, setErrorMessage] = useState<string | null>(syncManager.errorMessage);
  const [isRequestingSync, setIsRequestingSync] = useState<boolean>(syncManager.isRequestingSync);
  const [isSyncing, setIsSyncing] = useState<boolean>(syncManager.isSyncing);
  const [isQueuing, setIsQueuing] = useState<boolean>(syncManager.isQueuing);
  const [syncStage, setSyncStage] = useState<number | null>(syncManager.syncStage);
  const [progress, setProgress] = useState<number | null>(syncManager.progress);
  const [statusMessage, setStatusMessage] = useState<string | null>(syncManager.statusMessage);
  const [formattedLastSuccessfulSyncTime, setFormattedLastSuccessfulSyncTime] = useState<string>(
    formatlastSuccessfulSyncTime(syncManager.lastSuccessfulSyncTime),
  );

  useEffect(() => {
    const handler = (action, data): void => {
      setStatusMessage(syncManager.statusMessage); // Several events update the status message

      switch (action) {
        case SYNC_EVENT_ACTIONS.SYNC_STATUS_CHANGED:
          setIsRequestingSync(syncManager.isRequestingSync);
          setIsQueuing(syncManager.isQueuing);
          setIsSyncing(syncManager.isSyncing);
          setErrorMessage(data?.error);
          break;
        case SYNC_EVENT_ACTIONS.SYNC_STARTED:
          setSyncStarted(true);
          break;
        case SYNC_EVENT_ACTIONS.SYNC_PROGRESS_CHANGED:
          setProgress(syncManager.progress);
          break;
        case SYNC_EVENT_ACTIONS.SYNC_STAGE_CHANGED:
          setSyncStage(syncManager.syncStage);
          setFormattedLastSuccessfulSyncTime(
            formatlastSuccessfulSyncTime(syncManager.lastSuccessfulSyncTime),
          );
          break;
        default:
          break;
      }
    };
    syncManager.emitter.on('*', handler);
    return () => {
      syncManager.emitter.off('*', handler);
    };
  }, [syncManager]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedLastSuccessfulSyncTime(
        formatlastSuccessfulSyncTime(syncManager.lastSuccessfulSyncTime),
      );
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const manualSync = useCallback(() => {
    syncManager.triggerUrgentSync(queryClient);
  }, [syncManager, queryClient]);

  const syncFinishedSuccessfully =
    syncStarted && !isSyncing && !isQueuing && !errorMessage && !isRequestingSync;

  return (
    <Wrapper>
      {isMobile && <StickyMobileHeader onClose={() => navigate(-1)}>Sync</StickyMobileHeader>}

      <LayoutManager>
        <Content>
          <picture>
            <source srcSet="/datatrak-pin.svg" type="image/svg+xml" />
            <img aria-hidden src="/datatrak-pin.svg" height={80} width={80} />
          </picture>

          <StyledSyncStatus
            isSyncing={isSyncing}
            percentage={progress}
            message={statusMessage}
            syncStage={syncStage}
            totalStages={syncManager.stageCount}
            syncFinishedSuccessfully={syncFinishedSuccessfully}
            hasError={Boolean(errorMessage)}
          />

          {!isSyncing && !isRequestingSync && (
            <>
              {Boolean(formattedLastSuccessfulSyncTime) && (
                <StyledLastSyncDate
                  formattedLastSuccessfulSyncTime={formattedLastSuccessfulSyncTime}
                  lastSyncDate={syncManager.lastSuccessfulSyncTime}
                />
              )}

              <StyledButton onClick={manualSync}>Manual sync</StyledButton>
            </>
          )}

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </Content>
      </LayoutManager>
    </Wrapper>
  );
};
