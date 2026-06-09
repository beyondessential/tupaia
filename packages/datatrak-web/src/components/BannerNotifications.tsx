import React from 'react';

import { useCurrentUserContext } from '../api';
import { useIsOfflineFirst } from '../api/offlineFirst';
import { UpdateNotification } from './UpdateConfirmation';
import { ResetDataNotification } from '../views/ResetDataNotification';

export const BannerNotifications = () => {
  const isOfflineFirst = useIsOfflineFirst();
  const { isLoggedIn } = useCurrentUserContext();

  return (
    <>
      {isOfflineFirst && <UpdateNotification />}
      {isOfflineFirst && isLoggedIn && window.navigator.onLine && <ResetDataNotification />}
    </>
  );
};
