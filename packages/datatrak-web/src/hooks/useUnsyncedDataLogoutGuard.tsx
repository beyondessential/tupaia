import React, { useCallback, useState } from 'react';

import { getModelsForPush } from '@tupaia/sync';
import { useIsOfflineFirst } from '../api/offlineFirst';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { hasOutgoingChanges } from '../sync/hasOutgoingChanges';
import { useDatabaseContext } from './database';

export function useUnsyncedDataLogoutGuard(onLogout: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const isOfflineFirst = useIsOfflineFirst();
  const { models } = useDatabaseContext() || {};

  const guardedLogout = useCallback(async () => {
    if (isOfflineFirst && models) {
      const hasUnsyncedData = await hasOutgoingChanges(
        getModelsForPush(models.getModels()),
        models.localSystemFact,
      );
      if (hasUnsyncedData) {
        setIsOpen(true);
        return;
      }
    }
    onLogout();
  }, [isOfflineFirst, models, onLogout]);

  const confirmLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const confirmationModal = (
    <ConfirmationModal
      headingText="Unsynced data"
      bodyText="You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out"
      confirmText="Log out anyway"
      cancelText="Stay logged in"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={confirmLogout}
    />
  );

  return {
    guardedLogout,
    confirmationModal,
  };
}
