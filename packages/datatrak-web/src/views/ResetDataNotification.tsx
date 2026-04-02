import { Link } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

import { SyncFact } from '@tupaia/constants';
import { useDatabaseQuery, useSyncContext } from '../api';
import { useIsOfflineFirst } from '../api/offlineFirst';
import { useLogoutGuard } from '../hooks/useGuardedLogout';
import { BannerNotification } from './BannerNotification';

const StyledLink = styled(Link)`
  &.MuiLink-root {
    color: inherit;
    cursor: pointer;
    text-decoration-color: currentColor;
  }
`;

/**
 * @returns
 * - `true` if the current user’s permissions have changed since last sync;
 * - `false` if `they haven’t changed since last sync;
 * - `undefined` if result is pending;
 * - `null` if not using sync.
 */
function usePermissionsDidChange() {
  const isOfflineFirst = useIsOfflineFirst();
  const syncManager = useSyncContext()?.clientSyncManager;

  const query = useDatabaseQuery(
    ['permissionsChanged'],
    isOfflineFirst
      ? async ({ models }) => {
          const permissionsChanged = await models.localSystemFact.get(SyncFact.PERMISSIONS_CHANGED);
          return permissionsChanged === 'true';
        }
      : async () => null,
    {
      initialData: isOfflineFirst ? syncManager?.permissionsChanged : null,
      localContext: {},
    },
  );

  return query.data;
}

export const ResetDataNotification = () => {
  const permissionsChanged = usePermissionsDidChange();

  const { guardedLogout, confirmationModal } = useLogoutGuard();

  if (!permissionsChanged) {
    return null;
  }

  return (
    <>
      <BannerNotification>
        <strong>Permissions changed.</strong> Your permissions were updated while you were offline.{' '}
        <StyledLink onClick={guardedLogout}>Log out</StyledLink> and back in to get the latest data.
      </BannerNotification>
      {confirmationModal}
    </>
  );
};
