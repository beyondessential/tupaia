import React from 'react';
import { Link, Typography } from '@material-ui/core';
import { SmallModal } from '../../../components';
import { useRequestDeleteAccount } from '../../../api/mutations';
import { SpinningLoader } from '@tupaia/ui-components';
import { successToast } from '../../../utils';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  open: boolean;
}

const SuccessModal = ({ onClose }: { onClose: ConfirmDeleteModalProps['onClose'] }) => {
  const onCloseModal = () => {
    successToast('Your account deletion request has been successfully sent');
    onClose();
  };
  return (
    <SmallModal
      open
      onClose={onClose}
      title="Your request has been sent"
      secondaryButton={{
        label: 'Close',
        onClick: onCloseModal,
      }}
    >
      <Typography align="center">
        Your request to delete your account has been sent to our team. If you did this by mistake
        please email <Link href="mailto:admin@tupaia.org">admin@tupaia.org</Link>
      </Typography>
    </SmallModal>
  );
};

export const ConfirmDeleteModal = ({ open, onClose }: ConfirmDeleteModalProps) => {
  const { mutate: requestAccountDeletion, isLoading, isSuccess } = useRequestDeleteAccount();
  if (!open) return null;

  if (isSuccess) return <SuccessModal onClose={onClose} />;

  return (
    <SmallModal
      open
      onClose={onClose}
      title="Are you sure you want to request the deletion of your account?"
      primaryButton={
        isLoading
          ? null
          : {
              label: 'Request deletion',
              onClick: requestAccountDeletion as () => void,
            }
      }
      secondaryButton={
        isLoading
          ? null
          : {
              label: 'Cancel',
              onClick: onClose,
            }
      }
    >
      {isLoading ? (
        <SpinningLoader />
      ) : (
        <Typography align="center">
          Our Tupaia team will be alerted and we will email you with a confirmation once the
          deletion is complete
        </Typography>
      )}
    </SmallModal>
  );
};
