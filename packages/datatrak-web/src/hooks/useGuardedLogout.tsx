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

export function useLogoutGuard() {
  const { data: hasUnsyncedData } = useHasUnsyncedDataQuery();
  const { mutate: logOut } = useLogout();

  const { guardedCallback: guardedLogout, confirmationModal } = useConfirmationModal(
    () => void logOut(),
    {
      bypass: !hasUnsyncedData,
      confirmationModalProps: unsyncedDataModalProps,
    },
  );

  return { guardedLogout, confirmationModal };
}
