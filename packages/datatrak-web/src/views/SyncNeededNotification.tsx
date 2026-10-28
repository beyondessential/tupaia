import { Link } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useSyncContext } from '../api';
import { ROUTES } from '../constants';
import { useLastSyncTime } from '../sync/syncStatus';
import { BannerNotification } from './BannerNotification';

// Sync doesn’t force a long save on a busy user, so after this long without a successful sync we
// ask them to run one
const SYNC_NEEDED_AFTER_MS = 24 * 60 * 60_000;

const StyledLink = styled(Link)`
  &.MuiLink-root {
    color: inherit;
    cursor: pointer;
    text-decoration-color: currentColor;
  }
`;

function useIsSyncNeeded(): boolean {
  const syncManager = useSyncContext()?.clientSyncManager;
  const lastSyncTime = useLastSyncTime() ?? syncManager?.lastSuccessfulSyncTime ?? null;

  // Check again every minute, as the app can stay open for over a day
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Never synced since this check was added: nothing to compare against yet
  return !!lastSyncTime && now - lastSyncTime.getTime() > SYNC_NEEDED_AFTER_MS;
}

export const SyncNeededNotification = () => {
  const syncManager = useSyncContext()?.clientSyncManager;
  const isSyncNeeded = useIsSyncNeeded();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!isSyncNeeded) return null;

  // Same as tapping Manual sync, then show its progress on the Sync page
  const syncNow = () => {
    void syncManager?.triggerUrgentSync(queryClient);
    navigate(ROUTES.SYNC);
  };

  return (
    <BannerNotification>
      It’s been a while since your last sync. <StyledLink onClick={syncNow}>Sync now</StyledLink> to
      get the latest data.
    </BannerNotification>
  );
};
