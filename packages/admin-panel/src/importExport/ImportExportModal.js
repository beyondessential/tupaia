/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { connect } from 'react-redux';
import { importData, dismissDialog } from './actions';
import {
  getIsProcessing,
  getIsPreparingImport,
  getImportRecordType,
  getErrorMessage,
} from './selectors';
import { AsyncModal, InputField } from '../widgets';

export class ImportExportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      queryParameter: {},
    };
    autobind(this);
  }

  handleFiles({ target }) {
    this.setState({ file: target.files[0] });
  }

  handleQueryParameterChange(parameterKey, value) {
    this.setState({
      queryParameters: {
        ...this.state.queryParameters,
        [parameterKey]: value,
      },
    });
  }

  renderContent() {
    const { isPreparingImport, queryParameters, instruction } = this.props;
    return isPreparingImport ? (
      <div>
        <p>{instruction}</p>
        {queryParameters.map(queryParameter => (
          <InputField
            key={queryParameter.parameterKey}
            inputKey={queryParameter.parameterKey}
            {...queryParameter}
            onChange={this.handleQueryParameterChange}
            label={queryParameter.instruction}
            placeholder={queryParameter.label}
          />
        ))}
        <input type={'file'} onChange={event => this.handleFiles(event)} />
      </div>
    ) : null;
  }

  render() {
    const { isLoading, errorMessage, onImport, onDismiss, title } = this.props;
    const { file, queryParameters } = this.state;
    return (
      <AsyncModal
        isLoading={isLoading}
        errorMessage={errorMessage}
        renderContent={this.renderContent}
        isConfirmDisabled={!file}
        onConfirm={() => onImport(file, queryParameters)}
        confirmLabel={'Import'}
        onDismiss={onDismiss}
        title={title}
      />
    );
  }
}

ImportExportModalComponent.propTypes = {
  errorMessage: PropTypes.string,
  isPreparingImport: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  title: PropTypes.string,
  queryParameters: PropTypes.array,
  instruction: PropTypes.string,
};

ImportExportModalComponent.defaultProps = {
  errorMessage: null,
  title: null,
  queryParameters: [],
  instruction: '',
};

const mapStateToProps = state => ({
  isPreparingImport: getIsPreparingImport(state),
  isLoading: getIsProcessing(state),
  errorMessage: getErrorMessage(state),
  importEndpoint: getImportRecordType(state),
});

const mergeProps = ({ importEndpoint, ...restOfStateProps }, { dispatch }, ownProps) => ({
  ...restOfStateProps,
  ...ownProps,
  onDismiss: () => dispatch(dismissDialog()),
  onImport: (...args) => dispatch(importData(importEndpoint, ...args)),
});

export const ImportExportModal = connect(
  mapStateToProps,
  null,
  mergeProps,
)(ImportExportModalComponent);
