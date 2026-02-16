import React, { useCallback, useState } from 'react';

import { getModelsForPush } from '@tupaia/sync';
import { useIsOfflineFirst } from '../api/offlineFirst';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { hasOutgoingChanges } from '../sync/hasOutgoingChanges';
import { useDatabaseContext } from './database';

export function useGuardedLogout(onConfirm: React.MouseEventHandler<HTMLElement>) {
  const [isOpen, setIsOpen] = useState(false);
  const isOfflineFirst = useIsOfflineFirst();
  const { models } = useDatabaseContext() || {};

  const guardedLogout = useCallback(
    async (mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>) => {
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
      onConfirm(mouseEvent);
    },
    [isOfflineFirst, models, onConfirm],
  );

  const confirmLogout = (mouseEvent: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setIsOpen(false);
    onConfirm(mouseEvent);
  };

  const confirmationModal = (
    <ConfirmationModal
      heading="Unsynced data"
      description="You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out"
      confirmLabel="Log out anyway"
      cancelLabel="Stay logged in"
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
