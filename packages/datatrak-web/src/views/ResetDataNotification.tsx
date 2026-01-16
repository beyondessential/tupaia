import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, styled } from '@mui/material';

import { ensure } from '@tupaia/tsutils';
import { FACT_PERMISSIONS_CHANGED } from '@tupaia/constants';

import { BannerNotification } from './BannerNotification';
import { useLogout, useSyncContext } from '../api';
import { SYNC_EVENT_ACTIONS } from '../types/sync';
import { clearDatabase } from '../database/clearDatabase';
import { useDatabaseContext } from '../hooks/database';
import { ROUTES } from '../constants';

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
  const ensuredModels = ensure(models);
  const [permissionsChanged, setPermissionsChanged] = useState(
    clientSyncManager.permissionsChanged,
  );

  useEffect(() => {
    const loadPermissionsChanged = async () => {
      const permissionsChanged = await ensuredModels.localSystemFact.get(FACT_PERMISSIONS_CHANGED);
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
  }, []);

  if (!permissionsChanged) {
    return null;
  }

  const resetDatabase = useCallback(async () => {
    await clearDatabase(ensure(models));
    logout(undefined, { onSuccess: () => navigate(ROUTES.LOGIN) });
  }, [models, logout, navigate]);

  const Message = () => (
    <span>
      Looks like there was an update while you were offline,{' '}
      <StyledLink onClick={resetDatabase}>click here</StyledLink> to get the latest data
    </span>
  );

  return <BannerNotification message={<Message />} />;
};
