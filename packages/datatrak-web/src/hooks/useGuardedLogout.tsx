import React from 'react';

import { useLogout } from '../api/mutations/useLogout';
import { useHasUnsyncedDataQuery } from '../api/queries';
import { useAbandonSurveyGuard } from './useAbandonSurveyGuard';
import { useConfirmationModal } from './useConfirmationModal';

const unsyncedDataModalProps = {
  heading: 'Unsynced data',
  description:
    'You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out',
  confirmLabel: 'Log out anyway',
  cancelLabel: 'Stay logged in',
};

export function useLogoutGuard() {
  const { data: hasUnsyncedData } = useHasUnsyncedDataQuery();
  const { mutate: logOut } = useLogout();

  const { guardedCallback, confirmationModal: unsyncedDataModal } = useConfirmationModal(
    () => void logOut(),
    {
      bypass: !hasUnsyncedData,
      confirmationModalProps: unsyncedDataModalProps,
    },
  );

  // Use ‘Survey in progress’ modal as the outer guard so it takes precedence over ‘Unsynced data’
  // modal. i.e. If user is mid-survey AND has unsynced data, show ‘survey in progress’ warning
  // first.
  const { guardedCallback: doublyGuardedCallback, confirmationModal: abandonSurveyModal } =
    useAbandonSurveyGuard(guardedCallback);

  return {
    guardedLogout: doublyGuardedCallback,
    confirmationModal: (
      // Order doesn’t really matter; one shown at a time
      <>
        {unsyncedDataModal}
        {abandonSurveyModal}
      </>
    ),
  };
}
