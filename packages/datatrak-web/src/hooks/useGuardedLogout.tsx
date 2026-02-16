import React from 'react';

import { useHasUnsyncedDataQuery } from '../api/queries';
import { useConfirmationModal } from './useConfirmationModal';
import { useAbandonSurveyGuard } from './useAbandonSurveyGuard';

const unsyncedDataModalProps = {
  heading: 'Unsynced data',
  description:
    'You are about to log out with unsynced data! Go back to your home page and sync using the top right sync button and sync before logging out',
  confirmLabel: 'Log out anyway',
  cancelLabel: 'Stay logged in',
};

export function useGuardedLogout(callback: React.MouseEventHandler<HTMLElement>) {
  const { data: hasUnsyncedData } = useHasUnsyncedDataQuery();

  const { guardedCallback, confirmationModal: unsyncedDataModal } = useConfirmationModal(callback, {
    bypass: !hasUnsyncedData,
    confirmationModalProps: unsyncedDataModalProps,
  });

  // Use ‘Survey in progress’ modal as the outer guard so it takes precedence over ‘Unsynced data’ modal.
  // i.e. If user is mid-survey AND has unsynced data, show ‘survey in progress’ warning first.
  const { guardedCallback: doublyGuardedCallback, confirmationModal: abandonSurveyModal } =
    useAbandonSurveyGuard(guardedCallback);

  return {
    guardedCallback: doublyGuardedCallback,
    confirmationModal: (
      <>
        {unsyncedDataModal}
        {abandonSurveyModal}
      </>
    ),
  };
}
