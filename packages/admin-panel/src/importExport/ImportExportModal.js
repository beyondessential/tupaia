/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 500px;
`;

export const ImportExportModalComponent = ({
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
}) => {
  const [values, setValues] = useState({});

  const handleValueChange = (key, value) => {
    setValues(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <Dialog onClose={onDismiss} open={isOpen}>
      <DialogHeader onClose={onDismiss} title={title} />
      <Content>
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
                  onChange={handleValueChange}
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
      </Content>
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
};

ImportExportModalComponent.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  isConfirmDisabled: PropTypes.bool,
  children: PropTypes.element,
  queryParameters: PropTypes.array,
  parentRecord: PropTypes.object,
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
