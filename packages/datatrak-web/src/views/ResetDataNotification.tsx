import { Link, styled } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SyncFact } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import type { Handler } from 'mitt';
import { useLogout, useSyncContext } from '../api';
import { ROUTES } from '../constants';
import { clearDatabase } from '../database/clearDatabase';
import { useDatabaseContext } from '../hooks/database';
import { SYNC_EVENT_ACTIONS, SyncEvents } from '../types/sync';
import { BannerNotification } from './BannerNotification';

const StyledLink = styled(Link)`
  color: inherit;
  cursor: pointer;
  text-decoration-color: currentColor;
`;

function useOnPermissionChange(
  handler: Handler<SyncEvents[typeof SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED]>,
) {
  const syncManager = ensure(useSyncContext()?.clientSyncManager);
  useEffect(() => {
    syncManager.emitter.on(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    return () => {
      syncManager.emitter.off(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    };
  }, [syncManager]);
}

export const ResetDataNotification = () => {
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const clientSyncManager = ensure(useSyncContext()?.clientSyncManager);
  const models = ensure(useDatabaseContext()?.models);
  const [permissionsChanged, setPermissionsChanged] = useState(
    clientSyncManager.permissionsChanged,
  );

  useEffect(() => {
    const loadPermissionsChanged = async () => {
      const permissionsChanged = await models.localSystemFact.get(SyncFact.PERMISSIONS_CHANGED);
      setPermissionsChanged(permissionsChanged === 'true');
    };
    loadPermissionsChanged();
  }, [models]);

  useOnPermissionChange(syncEvent => void setPermissionsChanged(syncEvent.permissionsChanged));

  const resetDatabase = useCallback(async () => {
    await clearDatabase(models);
    logout(undefined, { onSuccess: () => navigate(ROUTES.LOGIN) });
  }, [models, logout, navigate]);

  if (!permissionsChanged) {
    return null;
  }

  const Message = () => (
    <>
      <strong>Permissions changed.</strong> Your permissions were updated while you were offline.{' '}
      <StyledLink onClick={resetDatabase}>Log out</StyledLink> and back in to get the latest data.
    </>
  );

  return <BannerNotification message={<Message />} />;
};
