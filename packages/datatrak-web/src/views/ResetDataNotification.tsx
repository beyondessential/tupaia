import { Link, styled } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { SyncFact } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import type { Handler } from 'mitt';
import { useLogout, useSyncContext } from '../api';
import { clearDatabase } from '../database/clearDatabase';
import { useDatabaseContext } from '../hooks/database';
import { useAbandonSurveyGuard } from '../hooks/useAbandonSurveyGuard';
import { useGuardedLogout } from '../hooks/useGuardedLogout';
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
  const syncManager = useSyncContext()?.clientSyncManager;
  useEffect(() => {
    syncManager?.emitter.on(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    return () => {
      syncManager?.emitter.off(SYNC_EVENT_ACTIONS.PERMISSIONS_CHANGED, handler);
    };
  }, [handler, syncManager]);
}

/** @returns True if and only if the current user’s permissions have changed since last sync. */
function usePermissionsDidChange() {
  const models = ensure(useDatabaseContext()?.models);
  const syncManager = ensure(useSyncContext()?.clientSyncManager);
  const [permissionsChanged, setPermissionsChanged] = useState(syncManager.permissionsChanged);

  useEffect(() => {
    const loadPermissionsChanged = async () => {
      const permissionsChanged = await models.localSystemFact.get(SyncFact.PERMISSIONS_CHANGED);
      setPermissionsChanged(permissionsChanged === 'true');
    };
    loadPermissionsChanged();
  }, [models]);

  const permissionChangeHandler = useCallback(
    syncEvent => void setPermissionsChanged(syncEvent.permissionsChanged),
    [],
  );
  useOnPermissionChange(permissionChangeHandler);

  return permissionsChanged;
}

export const ResetDataNotification = () => {
  const { mutateAsync: logOut } = useLogout();
  const models = ensure(useDatabaseContext()?.models);
  const permissionsChanged = usePermissionsDidChange();

  const resetDatabase = useCallback(async () => {
    await logOut();
    await clearDatabase(models);
  }, [logOut, models]);

  const { guardedLogout, confirmationModal: unsyncedDataModal } = useGuardedLogout(resetDatabase);

  const {
    // If mid-survey AND unsynced data, show ‘survey in progress’ modal, then ‘unsynced data’ modal.
    guardedCallback: doublyGuardedLogout,
    confirmationModal: surveyModal,
  } = useAbandonSurveyGuard(guardedLogout);

  if (!permissionsChanged) {
    return null;
  }

  return (
    <>
      <BannerNotification>
        <strong>Permissions changed.</strong> Your permissions were updated while you were offline.{' '}
        <StyledLink onClick={doublyGuardedLogout}>Log out</StyledLink> and back in to get the latest
        data.
      </BannerNotification>
      {surveyModal}
      {unsyncedDataModal}
    </>
  );
};
