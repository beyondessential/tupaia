/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  FileUploadField,
  OutlinedButton,
} from '@tupaia/ui-components';
import { connect } from 'react-redux';
import { dismissDialog, importData } from './actions';
import { ModalContentProvider, InputField } from '../widgets';

export const ImportModalComponent = ({
  isLoading,
  errorMessage,
  onDismiss,
  title,
  onImport,
  queryParameters,
  subtitle,
  children,
  parentRecord,
  isOpen,
}) => {
  const [values, setValues] = useState({});
  const [file, setFile] = useState(null);
  const [value, setValue] = useState(''); // To do: test removing value

  const handleValueChange = (key, val) => {
    setValues(prevState => ({
      ...prevState,
      [key]: val,
    }));
  };

  // Handle case of the file changing since it was uploaded
  // This is a workaround to handle an edge case in the file field error states
  // For more details see the tech debt issue. @see https://github.com/beyondessential/tupaia-backlog/issues/1211
  useEffect(() => {
    if (errorMessage === 'Failed to fetch') {
      setFile(null);
      setValue('');
    }
  }, [errorMessage]);

  // clear form state when modal is opened or closed
  useEffect(() => {
    setValues({});
  }, [isOpen]);

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

  const checkVisibilityCriteriaAreMet = visibilityCriteria => {
    if (!visibilityCriteria) {
      return true; // no visibility criteria to meet, fine to display
    }
    return Object.entries(visibilityCriteria).every(
      ([parameterKey, requiredValue]) => values[parameterKey] === requiredValue,
    );
  };

  return (
    <Dialog onClose={onDismiss} open={isOpen} disableBackdropClick>
      <DialogHeader
        onClose={onDismiss}
        title={fileErrorMessage ? 'Error' : title}
        color={fileErrorMessage ? 'error' : 'textPrimary'}
      />
      <ModalContentProvider errorMessage={fileErrorMessage} isLoading={isLoading}>
        <p>{subtitle}</p>
        {queryParameters
          .filter(({ visibilityCriteria }) => checkVisibilityCriteriaAreMet(visibilityCriteria))
          .map(queryParameter => {
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
        <FileUploadField onChange={event => handleFiles(event)} name="file-upload" />
      </ModalContentProvider>
      <DialogFooter>
        <OutlinedButton onClick={onDismiss} disabled={isLoading}>
          {fileErrorMessage ? 'Dismiss' : 'Cancel'}
        </OutlinedButton>
        <Button
          onClick={() => onImport(file, values)}
          disabled={!!fileErrorMessage || isLoading || !file}
        >
          Import
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

ImportModalComponent.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  queryParameters: PropTypes.array,
  parentRecord: PropTypes.object,
};

ImportModalComponent.defaultProps = {
  errorMessage: null,
  title: null,
  queryParameters: [],
  subtitle: '',
  parentRecord: {},
  children: null,
};

const mapStateToProps = ({ importExport }) => {
  const { isLoading, parentRecord } = importExport;

  return {
    isLoading,
    parentRecord,
    isOpen: importExport.isImportDialogOpen,
    errorMessage: importExport.errorMessage,
  };
};

const mapDispatchToProps = (dispatch, { actionConfig }) => ({
  onDismiss: () => dispatch(dismissDialog()),
  onImport: (file, queryParameters) =>
    dispatch(importData(actionConfig.importEndpoint, file, queryParameters)),
});

export const ImportModal = connect(mapStateToProps, mapDispatchToProps)(ImportModalComponent);
