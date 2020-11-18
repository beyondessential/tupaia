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
  LightOutlinedButton,
  OutlinedButton,
  SaveAlt,
} from '@tupaia/ui-components';
import { ModalContentProvider, InputField } from '../widgets';
import { api } from '../api';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

export const ImportModal = React.memo(({ title, subtitle, queryParameters, actionConfig }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({});
  const [file, setFile] = useState(null);

  const handleOpen = () => setIsOpen(true);

  const handleValueChange = (key, val) => {
    setValues(prevState => ({
      ...prevState,
      [key]: val,
    }));
  };

  const handleDismiss = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
  };

  const handleCancel = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
    setIsOpen(false);
    setValues({});
    setFile(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setErrorMessage(null);
    setStatus(STATUS.LOADING);

    const recordType = actionConfig.importEndpoint;
    const endpoint = `import/${recordType}`;

    try {
      await api.upload(endpoint, recordType, file, values);
      setIsOpen(false);
      setStatus(STATUS.SUCCESS);
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  };

  // Handle case of the file changing since it was uploaded
  // This is a workaround to handle an edge case in the file field error states
  // For more details see the tech debt issue. @see https://github.com/beyondessential/tupaia-backlog/issues/1211
  useEffect(() => {
    if (errorMessage === 'Failed to fetch') {
      setFile(null);
    }
  }, [errorMessage]);

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
    <>
      <Dialog onClose={handleCancel} open={isOpen} disableBackdropClick>
        <form>
          <DialogHeader
            onClose={handleCancel}
            title={fileErrorMessage ? 'Error' : title}
            color={fileErrorMessage ? 'error' : 'textPrimary'}
          />
          <ModalContentProvider
            errorMessage={fileErrorMessage}
            isLoading={status === STATUS.LOADING}
          >
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
                  />
                );
              })}
            <FileUploadField
              onChange={({ target }) => {
                setFile(target.files[0]);
              }}
              name="file-upload"
            />
          </ModalContentProvider>
          <DialogFooter>
            {status === STATUS.ERROR ? (
              <OutlinedButton onClick={handleDismiss}>Dismiss</OutlinedButton>
            ) : (
              <OutlinedButton onClick={handleCancel}>Cancel</OutlinedButton>
            )}
            <Button
              type="submit"
              disabled={status === STATUS.ERROR || !file}
              isLoading={status === STATUS.LOADING}
              onClick={handleSubmit}
            >
              Import
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      <LightOutlinedButton startIcon={<SaveAlt />} onClick={handleOpen}>
        Import
      </LightOutlinedButton>
    </>
  );
});

ImportModal.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  queryParameters: PropTypes.array,
  actionConfig: PropTypes.object,
};

ImportModal.defaultProps = {
  title: null,
  queryParameters: [],
  actionConfig: {},
  subtitle: '',
};
