/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImportIcon from '@material-ui/icons/Publish';
import { FileUploadField } from '@tupaia/ui-components';
import { InputField, Modal } from '../widgets';
import { useApiContext } from '../utilities/ApiProvider';
import { DATA_CHANGE_ERROR, DATA_CHANGE_REQUEST, DATA_CHANGE_SUCCESS } from '../table/constants';
import { checkVisibilityCriteriaAreMet, labelToId } from '../utilities';
import { ActionButton } from '../editor';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  TIMEOUT: 'timeout',
  SUCCESS: 'success',
  ERROR: 'error',
};

const defaultFinishedMessage = () => <span>Your import has been successfully processed.</span>;

export const ImportModalComponent = React.memo(
  ({
    title,
    subtitle,
    queryParameters,
    actionConfig,
    changeRequest,
    changeSuccess,
    changeError,
    getFinishedMessage,
    confirmButtonText,
    cancelButtonText,
    uploadButtonText,
    noFileMessage,
  }) => {
    const api = useApiContext();
    const [status, setStatus] = useState(STATUS.IDLE);
    const [finishedMessage, setFinishedMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState({});
    const [files, setFiles] = useState([]);
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
      setFinishedMessage(null);
      setFiles([]);
      setFileName(noFileMessage);
    };

    const handleClose = () => {
      setStatus(STATUS.IDLE);
      setErrorMessage(null);
      setFinishedMessage(null);
      setIsOpen(false);
      setValues({});
      setFiles([]);
      setFileName(noFileMessage);
    };

    const handleSubmit = async event => {
      event.preventDefault();
      setErrorMessage(null);
      setFinishedMessage(null);
      setStatus(STATUS.LOADING);
      changeRequest();

      const recordType = actionConfig.importEndpoint;
      const endpoint = `import/${recordType}`;

      try {
        const { body: response } = await api.upload(endpoint, recordType, files, {
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
          setFinishedMessage(getFinishedMessage(response));
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

    const getButtons = () => {
      switch (status) {
        case STATUS.TIMEOUT:
        case STATUS.SUCCESS:
          return [
            {
              text: 'Done',
              onClick: handleClose,
            },
          ];
        case STATUS.ERROR:
          return [
            {
              text: 'Dismiss',
              onClick: handleDismiss,
              variant: 'outlined',
            },
            {
              text: confirmButtonText,
              disabled: true,
            },
          ];
        default:
          return [
            {
              text: cancelButtonText,
              onClick: handleClose,
              variant: 'outlined',
              id: 'form-button-cancel',
            },
            {
              text: confirmButtonText,
              disabled: files.length === 0 || status === STATUS.LOADING,
              isLoading: status === STATUS.LOADING,
              onClick: handleSubmit,
              id: 'form-button-import',
              type: 'submit',
            },
          ];
      }
    };

    const buttons = getButtons();

    return (
      <>
        <Modal
          onClose={handleClose}
          isOpen={isOpen}
          disableBackdropClick
          title={fileErrorMessage ? 'Error' : title}
          errorMessage={fileErrorMessage}
          isLoading={status === STATUS.LOADING}
          buttons={buttons}
        >
          <form>
            {finishedMessage ? (
              <>{finishedMessage}</>
            ) : (
              <>
                <p>{subtitle}</p>
                {queryParameters
                  .filter(({ visibilityCriteria }) =>
                    checkVisibilityCriteriaAreMet(visibilityCriteria, values),
                  )
                  .map(queryParameter => {
                    const { parameterKey, ...restOfProps } = queryParameter;
                    return (
                      <InputField
                        key={parameterKey}
                        inputKey={parameterKey}
                        value={values[parameterKey]}
                        {...restOfProps}
                        onChange={handleValueChange}
                        id={`field-${labelToId(parameterKey)}`}
                      />
                    );
                  })}
                <FileUploadField
                  onChange={({ target }, newName) => {
                    setFileName(newName);
                    setFiles(Array.from(target.files));
                  }}
                  name="file-upload"
                  fileName={fileName}
                  multiple={actionConfig.multiple}
                  textOnButton={uploadButtonText}
                />
              </>
            )}
          </form>
        </Modal>
        <ActionButton id="page-import-button" startIcon={<ImportIcon />} onClick={handleOpen}>
          {confirmButtonText}
        </ActionButton>
      </>
    );
  },
);

ImportModalComponent.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  translate: PropTypes.func,
  queryParameters: PropTypes.array,
  actionConfig: PropTypes.object,
  changeRequest: PropTypes.func.isRequired,
  changeSuccess: PropTypes.func.isRequired,
  changeError: PropTypes.func.isRequired,
  getFinishedMessage: PropTypes.func,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  uploadButtonText: PropTypes.string,
  noFileMessage: PropTypes.string,
};

ImportModalComponent.defaultProps = {
  translate: text => text,
  title: null,
  queryParameters: [],
  actionConfig: {},
  subtitle: '',
  getFinishedMessage: defaultFinishedMessage, // response => react element
  confirmButtonText: 'Import',
  cancelButtonText: 'Cancel',
  uploadButtonText: 'Choose file',
  noFileMessage: 'No file chosen',
};

const mapDispatchToProps = dispatch => ({
  changeRequest: () => dispatch({ type: DATA_CHANGE_REQUEST }),
  changeSuccess: () => dispatch({ type: DATA_CHANGE_SUCCESS }),
  changeError: () => dispatch({ type: DATA_CHANGE_ERROR }),
});

export const ImportModal = connect(null, mapDispatchToProps)(ImportModalComponent);
