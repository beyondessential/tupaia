import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';

import { useRestoreArchivedAlert } from '../../api/queries';
import { ConfirmModal } from '../../components/Modal/ConfirmModal';
import { SuccessModal } from './SuccessModal';

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const RestoreArchivedAlertModal = ({ isOpen, onClose, alertId }) => {
  const [status, setStatus] = useState(STATUS.INITIAL);
  const { mutate: restoreArchivedAlert, error } = useRestoreArchivedAlert(alertId);

  const handleArchive = useCallback(async () => {
    setStatus(STATUS.LOADING);
    try {
      await restoreArchivedAlert();
    } catch (e) {
      setStatus(STATUS.ERROR);
      return;
    }
    setStatus(STATUS.SUCCESS);
  }, [restoreArchivedAlert]);

  const handleClose = useCallback(async () => {
    setStatus(STATUS.INITIAL);
    onClose();
  }, [onClose]);

  if (status === STATUS.SUCCESS) {
    return (
      <SuccessModal
        isOpen={isOpen}
        title="Restore Alert"
        mainText="Alert successfully restored"
        onClose={handleClose}
      />
    );
  }

  return (
    <ConfirmModal
      onClose={handleClose}
      isOpen={isOpen}
      isLoading={status === STATUS.LOADING}
      title="Archive Alert"
      mainText="Are you sure you want to restore this alert?"
      description="This alert will be moved to the Alert or Outbreak tab"
      error={error?.message}
      actionText="Restore"
      loadingText="Restoring"
      handleAction={handleArchive}
    />
  );
};

RestoreArchivedAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertId: PropTypes.string.isRequired,
};
