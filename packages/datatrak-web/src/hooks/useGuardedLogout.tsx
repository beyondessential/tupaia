import React, { useState } from 'react';
import { useLogout } from '../api/mutations/useLogout';
import { useHasUnsyncedDataQuery } from '../api/queries';
import { ConfirmationModal, ConfirmationModalProps } from '../components/ConfirmationModal';

const unsyncedDataModalProps = {
  heading: 'Unsynced data',
  description:
    'You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out',
  confirmLabel: 'Log out anyway',
  cancelLabel: 'Stay logged in',
};

interface UseLogoutGuardOptions {
  /** Called when the unsynced-data modal is dismissed without confirming. */
  onClose?: () => void;
}

export function useLogoutGuard({ onClose }: UseLogoutGuardOptions = {}) {
  const { data: hasUnsyncedData } = useHasUnsyncedDataQuery();
  const { mutate: logOut } = useLogout();

  const [isOpen, setIsOpen] = useState(false);

  const guardedLogout = (e?: React.MouseEvent<HTMLElement>) => {
    if (!hasUnsyncedData) {
      logOut();
      return;
    }
    e?.preventDefault();
    setIsOpen(true);
  };

  const onConfirm = () => {
    setIsOpen(false);
    logOut();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const confirmationModal: React.ReactElement<ConfirmationModalProps> = (
    <ConfirmationModal
      {...unsyncedDataModalProps}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={onConfirm}
    />
  );

  return { guardedLogout, confirmationModal };
}
