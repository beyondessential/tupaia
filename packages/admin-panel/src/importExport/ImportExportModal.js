/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'react-autobind';
import { connect } from 'react-redux';
import { dismissDialog } from './actions';
import { AsyncModal, InputField } from '../widgets';

export class ImportExportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryParameters: {},
    };
    autobind(this);
  }

  handleQueryParameterChange(parameterKey, value) {
    this.setState(prevState => ({
      queryParameters: {
        ...prevState.queryParameters,
        [parameterKey]: value,
      },
    }));
  }

  renderContent() {
    const { queryParameters, subtitle, children, parentRecord, isOpen } = this.props;
    if (!isOpen) return null;
    return (
      <div>
        <p>{subtitle}</p>
        {queryParameters.map(queryParameter => (
          <InputField
            key={queryParameter.parameterKey}
            inputKey={queryParameter.parameterKey}
            {...queryParameter}
            onChange={this.handleQueryParameterChange}
            label={queryParameter.label}
            secondaryLabel={queryParameter.secondaryLabel}
            parentRecord={parentRecord}
          />
        ))}
        {children}
      </div>
    );
  }

  render() {
    const {
      isLoading,
      errorMessage,
      onDismiss,
      title,
      isConfirmDisabled,
      onConfirm,
      confirmLabel,
    } = this.props;
    const { queryParameters } = this.state;
    return (
      <AsyncModal
        isLoading={isLoading}
        errorMessage={errorMessage}
        renderContent={this.renderContent}
        isConfirmDisabled={isConfirmDisabled}
        confirmLabel={confirmLabel}
        onConfirm={() => onConfirm(queryParameters)}
        onDismiss={onDismiss}
        title={title}
      />
    );
  }
}

ImportExportModalComponent.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  title: PropTypes.string,
  queryParameters: PropTypes.array,
  subtitle: PropTypes.string,
  isConfirmDisabled: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  children: PropTypes.element,
  parentRecord: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
};

ImportExportModalComponent.defaultProps = {
  errorMessage: null,
  title: null,
  queryParameters: [],
  subtitle: '',
  isConfirmDisabled: false,
  parentRecord: {},
  children: null,
};

const mapStateToProps = ({ importExport: importExportState }, { onConfirm }) => {
  const { isLoading, errorMessage, parentRecord } = importExportState;

  return {
    isLoading,
    errorMessage,
    parentRecord,
    onConfirm: queryParameters => onConfirm(queryParameters, parentRecord),
  };
};

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(dismissDialog()),
});

export const ImportExportModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportExportModalComponent);
