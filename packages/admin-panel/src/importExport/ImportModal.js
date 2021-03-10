/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImportIcon from '@material-ui/icons/Publish';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  FileUploadField,
  LightOutlinedButton,
  OutlinedButton,
} from '@tupaia/ui-components';
import { ModalContentProvider, InputField } from '../widgets';
import { api } from '../api';
import { DATA_CHANGE_REQUEST, DATA_CHANGE_SUCCESS, DATA_CHANGE_ERROR } from '../table/constants';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

const noFileMessage = 'No file chosen';

export const ImportModalComponent = React.memo(
  ({
    title,
    subtitle,
    queryParameters,
    actionConfig,
    changeRequest,
    changeSuccess,
    changeError,
  }) => {
    const [status, setStatus] = useState(STATUS.IDLE);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState({});
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState(noFileMessage);

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
      // Deselect file when dismissing an error, this avoids an error when editing selected files
      // @see https://github.com/beyondessential/tupaia-backlog/issues/1211
      setFile(null);
      setFileName(noFileMessage);
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
      changeRequest();

      const recordType = actionConfig.importEndpoint;
      const endpoint = `import/${recordType}`;

      try {
        await api.upload(endpoint, recordType, file, values);
        setIsOpen(false);
        setStatus(STATUS.SUCCESS);
        changeSuccess();
      } catch (error) {
        setStatus(STATUS.ERROR);
        setErrorMessage(error.message);
        changeError();
      }
    };

    // Print a more descriptive network timeout error
    // TODO: Remove this after https://github.com/beyondessential/tupaia-backlog/issues/1009 is fixed
    const fileErrorMessage =
      errorMessage === 'Network request timed out'
        ? 'Request timed out, but may have still succeeded. Please wait 2 minutes and check to see if the data has changed'
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
                .filter(({ visibilityCriteria }) =>
                  checkVisibilityCriteriaAreMet(visibilityCriteria),
                )
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
                onChange={({ target }, newName) => {
                  setFileName(newName);
                  setFile(target.files[0]);
                }}
                name="file-upload"
                fileName={fileName}
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
        <LightOutlinedButton startIcon={<ImportIcon />} onClick={handleOpen}>
          Import
        </LightOutlinedButton>
      </>
    );
  },
);

ImportModalComponent.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  queryParameters: PropTypes.array,
  actionConfig: PropTypes.object,
  changeRequest: PropTypes.func.isRequired,
  changeSuccess: PropTypes.func.isRequired,
  changeError: PropTypes.func.isRequired,
};

ImportModalComponent.defaultProps = {
  title: null,
  queryParameters: [],
  actionConfig: {},
  subtitle: '',
};

const mapDispatchToProps = dispatch => ({
  changeRequest: () => dispatch({ type: DATA_CHANGE_REQUEST }),
  changeSuccess: () => dispatch({ type: DATA_CHANGE_SUCCESS }),
  changeError: () => dispatch({ type: DATA_CHANGE_ERROR }),
});

export const ImportModal = connect(null, mapDispatchToProps)(ImportModalComponent);
