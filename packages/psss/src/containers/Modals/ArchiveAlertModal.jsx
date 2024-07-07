/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Typography from '@material-ui/core/Typography';

import {
  Button,
  OutlinedButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@tupaia/ui-components';

import { useArchiveAlert } from '../../api/queries';
import { AlertsPanelContext } from '../../context';
import { ConfirmModal } from '../../components';

const TickIcon = styled(CheckCircle)`
  font-size: 2.5rem;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.palette.success.main};
`;

const SuccessText = styled(Typography)`
  font-size: 1rem;
  margin-top: 1rem;
`;

const STATUS = {
  INITIAL: 'initial',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

export const ArchiveAlertModal = ({ isOpen, onClose, alertId }) => {
  const [status, setStatus] = useState(STATUS.INITIAL);
  const { setIsOpen } = useContext(AlertsPanelContext);
  const { mutate: archiveAlert, error } = useArchiveAlert(alertId);

  const handleArchive = useCallback(async () => {
    setStatus(STATUS.LOADING);
    try {
      await archiveAlert();
    } catch (e) {
      setStatus(STATUS.ERROR);
      return;
    }
    setStatus(STATUS.SUCCESS);
  }, [archiveAlert]);

  const handleClose = useCallback(() => {
    if (status === STATUS.SUCCESS) {
      setIsOpen(false);
    }
    onClose();
  }, [status, setIsOpen]);

  if (status === STATUS.SUCCESS) {
    return (
      <Dialog onClose={handleClose} open={isOpen}>
        <DialogHeader onClose={handleClose} title="Archive Alert" />
        <DialogContent>
          <TickIcon />
          <Typography variant="h6" gutterBottom>
            Alert successfully archived
          </Typography>
          <SuccessText>
            Please note that this information has been moved to the Archive tab.
          </SuccessText>
        </DialogContent>
        <DialogFooter>
          <OutlinedButton onClick={handleClose}>Stay on Alerts</OutlinedButton>
          <Button to="/alerts/archive" component={RouterLink}>
            Go to Archive
          </Button>
        </DialogFooter>
      </Dialog>
    );
  }

  return (
    <ConfirmModal
      onClose={handleClose}
      isOpen={isOpen}
      isLoading={status === STATUS.LOADING}
      title="Archive Alert"
      mainText="Are you sure you want to archive this alert?"
      description="This alert will be moved to the archive tab"
      error={error && error.message}
      actionText="Archive"
      loadingText="Archiving"
      handleAction={handleArchive}
    />
  );
};

ArchiveAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertId: PropTypes.string.isRequired,
};
