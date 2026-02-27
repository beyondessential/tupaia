import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { useSyncContext } from '../../api/SyncContext';
import { Button } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { useSyncEventListener, useSyncStatus } from '../../sync/syncStatus';
import { SYNC_EVENT_ACTIONS, SyncEvents } from '../../types';
import { useIsMobile } from '../../utils';
import { LastSyncDate } from './LastSyncDate';
import { SyncStatus } from './SyncStatus';
import { Handler } from 'mitt';

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
`;

const StyledLastSyncDate = styled(LastSyncDate)`
  margin-block-start: 2.25rem;
`;

const StyledButton = styled(Button)`
  margin-block-start: 2.25rem;
`;

export const SyncPage = () => {
  const syncManager = useSyncContext()?.clientSyncManager;
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    errorMessage,
    isRequestingSync,
    isSyncing,
    isQueuing,
    syncStage,
    progress,
    progressMessage,
  } = useSyncStatus();

  const [syncStarted, setSyncStarted] = useState<boolean>(syncManager?.isSyncing ?? false);
  const handler: Handler<SyncEvents[typeof SYNC_EVENT_ACTIONS.SYNC_STARTED]> = useCallback(
    () => setSyncStarted(true),
    [],
  );
  useSyncEventListener(SYNC_EVENT_ACTIONS.SYNC_STARTED, handler);

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
            totalStages={
              syncManager ? Object.keys(syncManager.progressMaxByStage).length : undefined
            }
            syncFinishedSuccessfully={syncFinishedSuccessfully}
            hasError={Boolean(errorMessage)}
          />

          {!isSyncing && !isRequestingSync && (
            <>
              <StyledLastSyncDate />
              <StyledButton onClick={() => void syncManager?.triggerUrgentSync(queryClient)}>
                Manual sync
              </StyledButton>
            </>
          )}

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </Content>
      </LayoutManager>
    </Wrapper>
  );
};
