/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
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
import { useApi } from '../utilities/ApiProvider';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  TIMEOUT: 'timeout',
  ERROR: 'error',
};

export const ExportModal = React.memo(({ title, exportEndpoint, fileName, values, children }) => {
  const api = useApi();
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);

  const handleDismiss = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
  };

  const handleClose = () => {
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
      const queryParameters = {
        respondWithEmailTimeout: 10 * 1000, // if an export doesn't finish in 10 seconds, email results
        ...values,
      };
      const { body: response } = await api.download(endpoint, queryParameters, fileName);
      if (response?.emailTimeoutHit) {
        setStatus(STATUS.TIMEOUT);
      } else {
        handleClose();
      }
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  };

  const renderButtons = useCallback(() => {
    switch (status) {
      case STATUS.TIMEOUT:
        return <Button onClick={handleClose}>Done</Button>;
      case STATUS.ERROR:
        return (
          <>
            <OutlinedButton onClick={handleDismiss}>Dismiss</OutlinedButton>
            <Button disabled>Export</Button>
          </>
        );
      default:
        return (
          <>
            <OutlinedButton onClick={handleClose}>Cancel</OutlinedButton>
            <Button type="submit" isLoading={status === STATUS.LOADING} onClick={handleSubmit}>
              Export
            </Button>
          </>
        );
    }
  }, [status, handleDismiss, handleClose, handleSubmit]);

  return (
    <>
      <Dialog onClose={handleClose} open={isOpen} disableBackdropClick>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader
            onClose={handleClose}
            title={errorMessage ? 'Error' : title}
            color={errorMessage ? 'error' : 'textPrimary'}
          />
          <ModalContentProvider errorMessage={errorMessage} isLoading={status === STATUS.LOADING}>
            {status === STATUS.TIMEOUT ? (
              <p>
                Export is taking a while, and will continue in the background. You will be emailed
                the exported file when the process completes.
              </p>
            ) : (
              children
            )}
          </ModalContentProvider>
          <DialogFooter>{renderButtons()}</DialogFooter>
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
