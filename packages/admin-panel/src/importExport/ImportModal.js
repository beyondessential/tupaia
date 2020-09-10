/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FileUploadField } from '@tupaia/ui-components';
import { importData } from './actions';
import { ImportExportModal } from './ImportExportModal';

export const ImportModalComponent = ({ onImport, isOpen, errorMessage, ...props }) => {
  const [file, setFile] = useState(null);
  const [value, setValue] = useState('');

  // Handle case of the file changing since it was uploaded
  // This is a workaround to handle an edge case in the file field error states
  // For more details see the tech debt issue. @see https://github.com/beyondessential/tupaia-backlog/issues/1211
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
    errorMessage === 'Failed to fetch' || errorMessage === 'Network request timed out'
      ? 'Failed to upload, probably because the import file has been edited. Please reselect it and try again.'
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
      <FileUploadField onChange={event => handleFiles(event)} name="file-upload" />
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
