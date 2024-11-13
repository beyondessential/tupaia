/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@tupaia/ui-components';
import { useApiContext } from '../utilities/ApiProvider';
import { ActionButton } from '../editor';
import { ExportIcon } from '../icons';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  TIMEOUT: 'timeout',
  ERROR: 'error',
};

export const ExportModal = React.memo(
  ({
    title,
    exportEndpoint,
    fileName,
    values,
    children,
    exportButtonText,
    cancelButtonText,
    isExportingMessage,
    onCloseModal,
  }) => {
    const api = useApiContext();
    const [status, setStatus] = useState(STATUS.IDLE);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);

    const handleDismiss = () => {
      setStatus(STATUS.IDLE);
      setError(null);
    };

    const handleClose = () => {
      setStatus(STATUS.IDLE);
      setError(null);
      setIsOpen(false);
      if (onCloseModal) {
        onCloseModal();
      }
    };

    const handleSubmit = async event => {
      event.preventDefault();
      setError(null);
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
      } catch (e) {
        setStatus(STATUS.ERROR);
        setError(e);
      }
    };

    const getButtons = () => {
      switch (status) {
        case STATUS.TIMEOUT:
        case STATUS.SUCCESS:
          return [
            {
              text: 'Done',
              onClick: handleClose,
              id: 'form-button-done',
            },
          ];
        case STATUS.ERROR:
          return [
            {
              text: 'Dismiss',
              onClick: handleDismiss,
              variant: 'outlined',
              id: 'form-button-dismiss',
            },
            {
              text: exportButtonText,
              disabled: true,
              id: 'form-button-export',
            },
          ];
        default:
          return [
            {
              text: cancelButtonText,
              onClick: handleClose,
              variant: 'outlined',
              id: 'form-button-cancel',
            },
            {
              text: exportButtonText,
              disabled: status === STATUS.LOADING,
              onClick: handleSubmit,
              id: 'form-button-import',
              type: 'submit',
            },
          ];
      }
    };
    const buttons = getButtons();

    return (
      <>
        <Modal
          onClose={handleClose}
          isOpen={isOpen}
          disableBackdropClick
          title={error ? 'Error' : title}
          error={error}
          isLoading={status === STATUS.LOADING}
          buttons={buttons}
        >
          <form onSubmit={handleSubmit} noValidate>
            {status === STATUS.TIMEOUT ? <p>{isExportingMessage}</p> : children}
          </form>
        </Modal>
        <ActionButton
          id="page-export-button"
          startIcon={<ExportIcon />}
          onClick={handleOpen}
          isLoading={status === STATUS.LOADING}
          disabled={status === STATUS.ERROR}
        >
          {exportButtonText}
        </ActionButton>
      </>
    );
  },
);

ExportModal.propTypes = {
  children: PropTypes.node.isRequired,
  exportEndpoint: PropTypes.string.isRequired,
  fileName: PropTypes.string,
  title: PropTypes.string,
  values: PropTypes.object,
  exportButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  isExportingMessage: PropTypes.string,
  onCloseModal: PropTypes.func,
};

ExportModal.defaultProps = {
  fileName: null,
  title: 'Export',
  exportButtonText: 'Download',
  cancelButtonText: 'Cancel',
  isExportingMessage:
    'Export is taking a while, and will continue in the background. You will be emailed the exported file when the process completes.',
  values: {},
  onCloseModal: null,
};
