/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { connect } from 'react-redux';
import { exportData } from './actions';
import { ImportExportModal } from './ImportExportModal';

export class ExportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  render() {
    const { onExport, isOpen, ...restOfProps } = this.props;
    return (
      <ImportExportModal
        confirmLabel="Export"
        onConfirm={(queryParameters, parentRecord) => onExport(queryParameters, parentRecord)}
        isOpen={isOpen}
        {...restOfProps}
      />
    );
  }
}

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
