import React from 'react';

import { useLogout } from '../api/mutations/useLogout';
import { useHasUnsyncedDataQuery } from '../api/queries';
import { useConfirmationModal } from './useConfirmationModal';

const unsyncedDataModalProps = {
  heading: 'Unsynced data',
  description:
    'You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out',
  confirmLabel: 'Log out anyway',
  cancelLabel: 'Stay logged in',
};

export function useGuardedLogout() {
  const { data: hasUnsyncedData } = useHasUnsyncedDataQuery();
  const { mutate: logOut } = useLogout();

  const { guardedCallback, confirmationModal } = useConfirmationModal(() => void logOut(), {
    bypass: !hasUnsyncedData,
    confirmationModalProps: unsyncedDataModalProps,
  });

  const triggerGuardedLogout = () => {
    // Create a synthetic mouse event to satisfy the guardedCallback signature
    guardedCallback({ preventDefault: () => {} } as React.MouseEvent<HTMLElement, MouseEvent>);
  };

  return {
    triggerGuardedLogout,
    confirmationModal,
  };
}
