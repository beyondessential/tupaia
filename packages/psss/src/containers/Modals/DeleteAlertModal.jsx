import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDeleteAlert } from '../../api/queries';
import { SuccessModal } from './SuccessModal';
import { ConfirmModal } from '../../components';

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const DeleteAlertModal = ({ isOpen, onClose, alertId }) => {
  const [status, setStatus] = useState(STATUS.INITIAL);
  const { mutate: deleteAlert, error } = useDeleteAlert(alertId);

  const handleDelete = useCallback(async () => {
    setStatus(STATUS.LOADING);
    try {
      await deleteAlert();
    } catch (e) {
      setStatus(STATUS.ERROR);
      return;
    }
    setStatus(STATUS.SUCCESS);
  }, [deleteAlert]);

  const handleClose = useCallback(async () => {
    setStatus(STATUS.INITIAL);
    onClose();
  }, [setStatus, onClose]);

  if (status === STATUS.SUCCESS) {
    return (
      <SuccessModal
        isOpen={isOpen}
        title="Delete Alert"
        mainText="Alert successfully deleted"
        onClose={handleClose}
      />
    );
  }

  return (
    <ConfirmModal
      onClose={handleClose}
      isOpen={isOpen}
      isLoading={status === STATUS.LOADING}
      title="Delete Alert"
      mainText="Are you sure you want to delete this alert?"
      error={error && error.message}
      actionText="Delete"
      loadingText="Deleting"
      handleAction={handleDelete}
    />
  );
};

DeleteAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertId: PropTypes.string.isRequired,
};
