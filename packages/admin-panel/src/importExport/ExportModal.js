/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  LightOutlinedButton,
  OutlinedButton,
  SaveAlt,
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

export const ExportModal = ({ title, exportEndpoint, exportFileName, values, children }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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
      await api.download(endpoint, values, exportFileName);
      setStatus(STATUS.SUCCESS);
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} disableBackdropClick>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader
            onClose={() => setIsOpen(false)}
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
        startIcon={<SaveAlt />}
        onClick={() => setIsOpen(true)}
        isLoading={STATUS === STATUS.LOADING}
        disabled={STATUS === STATUS.ERROR}
      >
        Export
      </LightOutlinedButton>
    </>
  );
};

ExportModal.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.string,
  exportEndpoint: PropTypes.string.isRequired,
  exportFileName: PropTypes.string.isRequired,
  values: PropTypes.object,
};

ExportModal.defaultProps = {
  title: 'Export',
  values: {},
};
