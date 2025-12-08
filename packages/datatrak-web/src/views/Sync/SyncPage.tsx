import { useQueryClient } from '@tanstack/react-query';
import { Handler } from 'mitt';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { ensure } from '@tupaia/tsutils';
import { useSyncContext } from '../../api/SyncContext';
import { Button } from '../../components';
import { StickyMobileHeader } from '../../layout';
import { useSyncStatus } from '../../sync/syncStatus';
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
`;

const StyledLastSyncDate = styled(LastSyncDate)`
  margin-block-start: 2.25rem;
`;

const StyledButton = styled(Button)`
  margin-block-start: 2.25rem;
`;

export const SyncPage = () => {
  const { clientSyncManager } = useSyncContext() || {};
  const syncManager = ensure(clientSyncManager);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [syncStarted, setSyncStarted] = useState<boolean>(syncManager.isSyncing);
  const {
    errorMessage,
    isRequestingSync,
    isSyncing,
    isQueuing,
    syncStage,
    progress,
    progressMessage,
    lastSyncTime,
  } = useSyncStatus();

  const handler: Handler = useCallback(() => void setSyncStarted(true), []);
  useEffect(() => {
    syncManager.emitter.on(SYNC_EVENT_ACTIONS.SYNC_STARTED, handler);
    return () => void syncManager.emitter.off(SYNC_EVENT_ACTIONS.SYNC_STARTED, handler);
  }, [handler, syncManager]);

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
            message={progressMessage}
            syncStage={syncStage}
            totalStages={Object.keys(syncManager.progressMaxByStage).length}
            syncFinishedSuccessfully={syncFinishedSuccessfully}
            hasError={Boolean(errorMessage)}
          />

          {!isSyncing && !isRequestingSync && (
            <>
              {Boolean(lastSyncTime) && <StyledLastSyncDate lastSyncDate={lastSyncTime} />}

              <StyledButton onClick={manualSync}>Manual sync</StyledButton>
            </>
          )}

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </Content>
      </LayoutManager>
    </Wrapper>
  );
};
