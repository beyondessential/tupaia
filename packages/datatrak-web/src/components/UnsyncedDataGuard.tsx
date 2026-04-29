import React, { useState } from 'react';
import { useHasUnsyncedDataQuery } from '../api/queries';
import { ROUTES } from '../constants';
import { useNavigationBlocker } from '../utils';
import { ConfirmationModal } from './ConfirmationModal';

/**
 * Blocks navigation to /logout when there is unsynced data and shows a
 * confirmation modal. If the user confirms, navigation proceeds to the logout
 * page. If cancelled, navigation is reset and the user is sent home.
 */
export const UnsyncedDataGuard = () => {
  const { data: hasUnsyncedData } = useHasUnsyncedDataQuery();

  const [isOpen, setIsOpen] = useState(false);

  const { proceed, reset } = useNavigationBlocker({
    active: !!hasUnsyncedData,
    onBlock: () => setIsOpen(true),
    shouldBlock: (pathname: string) => pathname === ROUTES.LOGOUT,
  });

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const handleConfirm = () => {
    setIsOpen(false);
    proceed();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      heading="Unsynced data"
      description="You are about to log out with unsynced data! Go back to the home page and sync using the top right sync button and sync before logging out"
      confirmLabel="Log out anyway"
      cancelLabel="Stay logged in"
    />
  );
};
