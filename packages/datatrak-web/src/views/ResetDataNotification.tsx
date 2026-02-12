import { Link, styled } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SyncFact } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import { useLogout, useSyncContext } from '../api';
import { ROUTES } from '../constants';
import { clearDatabase } from '../database/clearDatabase';
import { useDatabaseContext } from '../hooks/database';
import { SYNC_EVENT_ACTIONS } from '../types/sync';
import { BannerNotification } from './BannerNotification';

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.palette.common.white};
  text-decoration-color: ${({ theme }) => theme.palette.common.white};
  cursor: pointer;
`;

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

  useEffect(() => {
    const handler = ({ permissionsChanged }: { permissionsChanged: boolean }) => {
      setPermissionsChanged(permissionsChanged);
    };
    clientSyncManager.emitter.on(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    return () => {
      clientSyncManager.emitter.off(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    };

    // we only want to set up once to avoid multiple subscriptions
  }, [clientSyncManager]);

  if (!permissionsChanged) {
    return null;
  }

  const resetDatabase = useCallback(async () => {
    await clearDatabase(models);
    logout(undefined, { onSuccess: () => navigate(ROUTES.LOGIN) });
  }, [models, logout, navigate]);

  const Message = () => (
    <>
      <strong>Permissions changed.</strong> Your permissions were updated while you were offline.{' '}
      <StyledLink onClick={resetDatabase}>Log out</StyledLink> and back in to get the latest data.
    </>
  );

  return <BannerNotification message={<Message />} />;
};
