/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { importData } from './actions';
import { ImportExportModal } from './ImportExportModal';

export const ImportModalComponent = ({ onImport, isOpen, ...props }) => {
  const [file, setFile] = useState(null);

  const handleFiles = ({ target }) => {
    setFile(target.files[0]);
  };

  return (
    <ImportExportModal
      isConfirmDisabled={!file}
      confirmLabel="Import"
      onConfirm={queryParameters => onImport(file, queryParameters)}
      isOpen={isOpen}
      {...props}
    >
      <input type="file" onChange={event => handleFiles(event)} />
    </ImportExportModal>
  );
};

ImportModalComponent.propTypes = {
  onImport: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ importExport }) => ({
  isOpen: importExport.isImportDialogOpen,
});

const mapDispatchToProps = (dispatch, { actionConfig }) => ({
  onImport: (file, queryParameters) =>
    dispatch(importData(actionConfig.importEndpoint, file, queryParameters)),
});

export const ImportModal = connect(mapStateToProps, mapDispatchToProps)(ImportModalComponent);
