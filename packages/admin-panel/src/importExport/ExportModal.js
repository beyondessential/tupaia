/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  LightOutlinedButton,
  OutlinedButton,
  SaveAlt,
} from '@tupaia/ui-components';
import { filteredExportData } from './actions';
import { ModalContentProvider } from '../widgets';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

const ExportModalComponent = ({ onExport, title, config, values, children }) => {
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
      await onExport(values, config);
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

ExportModalComponent.propTypes = {
  onExport: PropTypes.func.isRequired,
  children: PropTypes.any.isRequired,
  title: PropTypes.string,
  config: PropTypes.object.isRequired,
  values: PropTypes.object,
};

ExportModalComponent.defaultProps = {
  title: 'Export',
  values: {},
};

const mapDispatchToProps = dispatch => ({
  onExport: (queryParams, config) => dispatch(filteredExportData(config, queryParams)),
});

export const ExportModal = connect(null, mapDispatchToProps)(ExportModalComponent);
