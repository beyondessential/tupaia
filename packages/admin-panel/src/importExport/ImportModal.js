/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
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
  TIMEOUT: 'timeout',
  SUCCESS: 'success',
  ERROR: 'error',
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
    const [finishedMessage, setFinishedMessage] = useState(null);
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

    const handleClose = () => {
      setStatus(STATUS.IDLE);
      setErrorMessage(null);
      setIsOpen(false);
      setValues({});
      setFile(null);
      setFileName(noFileMessage);
    };

    const handleSubmit = async event => {
      event.preventDefault();
      setErrorMessage(null);
      setStatus(STATUS.LOADING);
      changeRequest();

      const recordType = actionConfig.importEndpoint;
      const endpoint = `import/${recordType}`;

      try {
        const { body: response } = await api.upload(endpoint, recordType, file, {
          ...values,
          ...actionConfig.extraQueryParameters,
        });
        if (response.emailTimeoutHit) {
          setStatus(STATUS.TIMEOUT);
          setFinishedMessage(
            'Import is taking a while, and will continue in the background. You will be emailed when the import process completes.',
          );
        } else {
          setStatus(STATUS.SUCCESS);
          setFinishedMessage('Your import has been successfully processed.');
        }
        changeSuccess();
      } catch (error) {
        setStatus(STATUS.ERROR);
        setFinishedMessage(null);
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

    const renderButtons = useCallback(() => {
      switch (status) {
        case STATUS.TIMEOUT:
        case STATUS.SUCCESS:
          return <Button onClick={handleClose}>Done</Button>;
        case STATUS.ERROR:
          return (
            <>
              <OutlinedButton onClick={handleDismiss}>Dismiss</OutlinedButton>
              <Button disabled>Import</Button>
            </>
          );
        default:
          return (
            <>
              <OutlinedButton onClick={handleClose}>Cancel</OutlinedButton>
              <Button
                type="submit"
                disabled={!file}
                isLoading={status === STATUS.LOADING}
                onClick={handleSubmit}
              >
                Import
              </Button>
            </>
          );
      }
    }, [status, file, handleDismiss, handleClose, handleSubmit]);

    return (
      <>
        <Dialog onClose={handleClose} open={isOpen} disableBackdropClick>
          <form>
            <DialogHeader
              onClose={handleClose}
              title={fileErrorMessage ? 'Error' : title}
              color={fileErrorMessage ? 'error' : 'textPrimary'}
            />
            <ModalContentProvider
              errorMessage={fileErrorMessage}
              isLoading={status === STATUS.LOADING}
            >
              {finishedMessage ? (
                <p>{finishedMessage}</p>
              ) : (
                <>
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
                </>
              )}
            </ModalContentProvider>
            <DialogFooter>{renderButtons()}</DialogFooter>
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
