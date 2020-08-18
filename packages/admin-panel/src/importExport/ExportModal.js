/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { exportData } from './actions';
import { ImportExportModal } from './ImportExportModal';

const ExportModalComponent = ({ onExport, isOpen, ...restOfProps }) => (
  <ImportExportModal
    confirmLabel="Export"
    onConfirm={(queryParameters, parentRecord) => onExport(queryParameters, parentRecord)}
    isOpen={isOpen}
    {...restOfProps}
  />
);

ExportModalComponent.propTypes = {
  onExport: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ importExport }) => ({
  isOpen: importExport.isExportDialogOpen,
});

const mapDispatchToProps = (dispatch, { actionConfig }) => ({
  onExport: (queryParameters, parentRecord) =>
    dispatch(exportData(actionConfig, parentRecord, queryParameters)),
});

export const ExportModal = connect(mapStateToProps, mapDispatchToProps)(ExportModalComponent);
