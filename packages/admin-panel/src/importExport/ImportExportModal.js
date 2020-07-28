/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  OutlinedButton,
  Toast,
} from '@tupaia/ui-components';
import { connect } from 'react-redux';
import { dismissDialog } from './actions';
import { InputField } from '../widgets';

export class ImportExportModalComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
    };
  }

  static getDerivedStateFromProps(props) {
    const { isOpen } = props;
    return isOpen ? null : { values: {} };
  }

  handleValueChange = (key, value) => {
    this.setState(prevState => ({
      values: {
        ...prevState.values,
        [key]: value,
      },
    }));
  };

  render() {
    const { values } = this.state;
    const {
      isLoading,
      errorMessage,
      onDismiss,
      title,
      isConfirmDisabled,
      onConfirm,
      confirmLabel,
      queryParameters,
      subtitle,
      children,
      parentRecord,
      isOpen,
    } = this.props;

    if (!isOpen) return null;

    return (
      <Dialog onClose={onDismiss} open={isOpen}>
        <DialogHeader onClose={onDismiss} title={title} />
        <DialogContent>
          {isLoading ? (
            'Please be patient, this can take some time...'
          ) : (
            <>
              <p>{subtitle}</p>
              {queryParameters.map(queryParameter => {
                const { parameterKey, label, secondaryLabel } = queryParameter;
                return (
                  <InputField
                    key={parameterKey}
                    inputKey={parameterKey}
                    value={values[parameterKey]}
                    {...queryParameter}
                    onChange={this.handleValueChange}
                    label={label}
                    secondaryLabel={secondaryLabel}
                    parentRecord={parentRecord}
                  />
                );
              })}
              {children}
            </>
          )}
          {errorMessage && <Toast severity="error">{errorMessage}</Toast>}
        </DialogContent>
        <DialogFooter>
          <OutlinedButton onClick={onDismiss} disabled={isLoading}>
            {errorMessage ? 'Dismiss' : 'Cancel'}
          </OutlinedButton>
          <Button
            onClick={() => onConfirm(values)}
            disabled={!!errorMessage || isLoading || isConfirmDisabled}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Dialog>
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
    onConfirm: values => onConfirm(values, parentRecord),
  };
};

const mapDispatchToProps = dispatch => ({
  onDismiss: () => dispatch(dismissDialog()),
});

export const ImportExportModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportExportModalComponent);
