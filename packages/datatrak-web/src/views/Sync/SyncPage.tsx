import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { Button } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { useIsMobile } from '../../utils';
import { LastSyncDate } from './LastSyncDate';
import { SyncStatus } from './SyncStatus';
import { SYNC_EVENT_ACTIONS } from '../../types';
import { formatDistance } from 'date-fns';
import { useSyncContext } from '../../api/SyncContext';
import { ensure } from '@tupaia/tsutils';

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

  const [syncStarted, setSyncStarted] = useState<boolean>(syncManager.isSyncing);
  const [errorMessage, setErrorMessage] = useState<string | null>(syncManager.errorMessage);
  const [isRequestingSync, setIsRequestingSync] = useState<boolean>(syncManager.isRequestingSync);
  const [isSyncing, setIsSyncing] = useState<boolean>(syncManager.isSyncing);
  const [isQueuing, setIsQueuing] = useState<boolean>(syncManager.isQueuing);
  const [syncStage, setSyncStage] = useState<number | null>(syncManager.syncStage);
  const [progress, setProgress] = useState<number | null>(syncManager.progress);
  const [progressMessage, setProgressMessage] = useState<string | null>(
    syncManager.progressMessage,
  );
  const [formattedLastSuccessfulSyncTime, setFormattedLastSuccessfulSyncTime] = useState<string>(
    formatlastSuccessfulSyncTime(syncManager.lastSuccessfulSyncTime),
  );

  useEffect(() => {
    const handler = (action, data): void => {
      switch (action) {
        case SYNC_EVENT_ACTIONS.SYNC_INITIALISING:
          setProgressMessage(syncManager.progressMessage);
          setIsRequestingSync(true);
          setErrorMessage(null);
          break;
        case SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE:
          setProgress(0);
          setIsRequestingSync(false);
          setIsQueuing(true);
          setIsSyncing(false);
          setErrorMessage(null);
          setProgressMessage(syncManager.progressMessage);
          break;
        case SYNC_EVENT_ACTIONS.SYNC_STARTED:
          setIsRequestingSync(false);
          setIsQueuing(false);
          setSyncStarted(true);
          setIsSyncing(true);
          setProgress(0);
          setProgressMessage('Initialising sync');
          setSyncStage(1);
          setErrorMessage(null);
          break;
        case SYNC_EVENT_ACTIONS.SYNC_ENDED:
          setIsRequestingSync(false);
          setIsQueuing(false);
          setIsSyncing(false);
          setProgress(0);
          setProgressMessage('');
          break;
        case SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED:
          setSyncStage(syncManager.syncStage);
          setProgress(syncManager.progress);
          setProgressMessage(syncManager.progressMessage);
          setFormattedLastSuccessfulSyncTime(
            formatlastSuccessfulSyncTime(syncManager.lastSuccessfulSyncTime),
          );
          break;
        case SYNC_EVENT_ACTIONS.SYNC_ERROR:
          setIsRequestingSync(false);
          setIsQueuing(false);
          setErrorMessage(data.error);
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

  const manualSync = useCallback(() => {
    syncManager.triggerUrgentSync();
  }, [syncManager]);

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
            message={progressMessage}
            syncStage={syncStage}
            totalStages={Object.keys(syncManager.progressMaxByStage).length}
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

              <StyledButton onClick={manualSync}>Sync now</StyledButton>
            </>
          )}

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </Content>
      </LayoutManager>
    </Wrapper>
  );
};
