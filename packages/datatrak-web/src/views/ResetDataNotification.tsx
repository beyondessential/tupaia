import React, { useEffect, useState } from 'react';
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
  const { clientSyncManager } = useSyncContext() || {};
  const syncManager = ensure(clientSyncManager);
  const { models } = useDatabaseContext() || {};
  const [permissionsChanged, setPermissionsChanged] = useState(syncManager.permissionsChanged);

  useEffect(() => {
    const loadPermissionsChanged = async () => {
      const permissionsChanged = await models?.localSystemFact.get(FACT_PERMISSIONS_CHANGED);
      setPermissionsChanged(Boolean(permissionsChanged));
    };

    loadPermissionsChanged();
  }, [models]);

  useEffect(() => {
    const handler = ({ permissionsChanged }: { permissionsChanged: boolean }) => {
      setPermissionsChanged(permissionsChanged);
    };
    syncManager.emitter.on(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    return () => {
      syncManager.emitter.off(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    };
  }, []);

  const isOnline = window.navigator.onLine;

  if (!permissionsChanged || !isOnline) {
    return null;
  }

  const resetDatabase = async () => {
    await clearDatabase(ensure(models));
    logout(undefined, { onSuccess: () => navigate(ROUTES.LOGIN) });
  };

  const Message = () => (
    <span>
      Looks like there was an update while you were offline,{' '}
      <StyledLink
        onClick={resetDatabase}
      >
        click here
      </StyledLink>{' '}
      to get the latest data
    </span>
  );

  return <BannerNotification message={<Message />} />;
};
