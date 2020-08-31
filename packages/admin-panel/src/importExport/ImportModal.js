/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { importData } from './actions';
import { ImportExportModal } from './ImportExportModal';

export const ImportModalComponent = ({ onImport, isOpen, errorMessage, ...props }) => {
  const [file, setFile] = useState(null);
  const [value, setValue] = useState('');

  // Handle case of the file changing since it was uploaded
  useEffect(() => {
    if (errorMessage === 'Failed to fetch') {
      setFile(null);
      setValue('');
    }
  }, [errorMessage]);

  // Clear the file field state when the modal opens and closes
  useEffect(() => {
    setFile(null);
    setValue('');
  }, [isOpen]);

  const handleFiles = ({ target }) => {
    setFile(target.files[0]);
    setValue(target.value);
  };

  const fileErrorMessage =
    errorMessage === 'Failed to fetch'
      ? 'The file has changed, please upload it again.'
      : errorMessage;

  return (
    <ImportExportModal
      isConfirmDisabled={!file}
      confirmLabel="Import"
      onConfirm={queryParameters => onImport(file, queryParameters)}
      isOpen={isOpen}
      errorMessage={fileErrorMessage}
      {...props}
    >
      <input type="file" onChange={event => handleFiles(event)} value={value} />
    </ImportExportModal>
  );
};

ImportModalComponent.propTypes = {
  onImport: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

ImportModalComponent.defaultProps = {
  errorMessage: null,
};

const mapStateToProps = ({ importExport }) => ({
  isOpen: importExport.isImportDialogOpen,
  errorMessage: importExport.errorMessage,
});

const mapDispatchToProps = (dispatch, { actionConfig }) => ({
  onImport: (file, queryParameters) =>
    dispatch(importData(actionConfig.importEndpoint, file, queryParameters)),
});

export const ImportModal = connect(mapStateToProps, mapDispatchToProps)(ImportModalComponent);
