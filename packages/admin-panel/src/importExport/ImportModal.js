/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { importData } from './actions';
import { ImportExportModal } from './ImportExportModal';

export class ImportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

  static getDerivedStateFromProps(props) {
    const { isOpen } = props;
    return isOpen ? null : { file: null };
  }

  handleFiles = ({ target }) => {
    this.setState({ file: target.files[0] });
  };

  render() {
    const { file } = this.state;
    const { onImport, isOpen, ...restOfProps } = this.props;
    return (
      <ImportExportModal
        isConfirmDisabled={!file}
        confirmLabel="Import"
        onConfirm={queryParameters => onImport(file, queryParameters)}
        isOpen={isOpen}
        {...restOfProps}
      >
        <input type="file" onChange={event => this.handleFiles(event)} />
      </ImportExportModal>
    );
  }
}

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
