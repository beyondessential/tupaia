/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ExportIcon from '@material-ui/icons/GetApp';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  LightOutlinedButton,
  OutlinedButton,
} from '@tupaia/ui-components';
import { ModalContentProvider } from '../widgets';
import { api } from '../api';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

export const ExportModal = React.memo(({ title, exportEndpoint, fileName, values, children }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);

  const handleDismiss = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
  };

  const handleCancel = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
    setIsOpen(false);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setErrorMessage(null);
    setStatus(STATUS.LOADING);

    try {
      const endpoint = `export/${exportEndpoint}`;
      await api.download(endpoint, values, fileName);
      setIsOpen(false);
      setStatus(STATUS.SUCCESS);
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <Dialog onClose={handleCancel} open={isOpen} disableBackdropClick>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader
            onClose={handleCancel}
            title={errorMessage ? 'Error' : title}
            color={errorMessage ? 'error' : 'textPrimary'}
          />
          <ModalContentProvider errorMessage={errorMessage} isLoading={status === STATUS.LOADING}>
            {children}
          </ModalContentProvider>
          <DialogFooter>
            {status === STATUS.ERROR ? (
              <OutlinedButton onClick={handleDismiss}>Dismiss</OutlinedButton>
            ) : (
              <OutlinedButton onClick={handleCancel}>Cancel</OutlinedButton>
            )}
            <Button
              type="submit"
              disabled={status === STATUS.ERROR}
              isLoading={status === STATUS.LOADING}
            >
              Export
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      <LightOutlinedButton
        startIcon={<ExportIcon />}
        onClick={handleOpen}
        isLoading={STATUS === STATUS.LOADING}
        disabled={STATUS === STATUS.ERROR}
      >
        Export
      </LightOutlinedButton>
    </>
  );
});

ExportModal.propTypes = {
  children: PropTypes.node.isRequired,
  exportEndpoint: PropTypes.string.isRequired,
  fileName: PropTypes.string.isRequired,
  title: PropTypes.string,
  values: PropTypes.object,
};

ExportModal.defaultProps = {
  title: 'Export',
  values: {},
};
