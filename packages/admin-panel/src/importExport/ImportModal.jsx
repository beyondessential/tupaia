import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FileUploadField, Modal } from '@tupaia/ui-components';
import { InputField } from '../widgets';
import { useApiContext } from '../utilities/ApiProvider';
import { DATA_CHANGE_ERROR, DATA_CHANGE_REQUEST, DATA_CHANGE_SUCCESS } from '../table/constants';
import { checkVisibilityCriteriaAreMet, labelToId } from '../utilities';
import { ActionButton } from '../editor';
import { ImportIcon } from '../icons';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  TIMEOUT: 'timeout',
  SUCCESS: 'success',
  ERROR: 'error',
};

const defaultFinishedMessage = () => 'Your import has been successfully processed';

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
  }) => {
    const api = useApiContext();
    const [status, setStatus] = useState(STATUS.IDLE);
    const [finishedMessage, setFinishedMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [values, setValues] = useState({});
    const [files, setFiles] = useState([]);

    const handleOpen = () => setIsOpen(true);

    const handleValueChange = (key, val) => {
      setValues(prevState => ({
        ...prevState,
        [key]: val,
      }));
    };

    const handleDismiss = () => {
      setStatus(STATUS.IDLE);
      setError(null);
      setFinishedMessage(null);
      setFiles([]);
    };

    const handleClose = () => {
      setStatus(STATUS.IDLE);
      setError(null);
      setFinishedMessage(null);
      setIsOpen(false);
      setValues({});
      setFiles([]);
    };

    const handleSubmit = async event => {
      event.preventDefault();
      setError(null);
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
      } catch (e) {
        // Print a more descriptive network timeout error
        // TODO: Remove this after https://github.com/beyondessential/tupaia-backlog/issues/1009 is fixed
        const errorMessage =
          e.message === 'Network request timed out'
            ? 'Request timed out, but may have still succeeded. Please wait 2 minutes and check to see if the data has changed'
            : e.message;
        setStatus(STATUS.ERROR);
        setFinishedMessage(null);
        setError({
          ...e,
          message: errorMessage,
        });
        changeError();
      }
    };

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
              text: 'Close',
              onClick: handleDismiss,
              variant: 'contained',
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
          title={error ? 'Error' : title}
          error={error}
          isLoading={status === STATUS.LOADING}
          buttons={buttons}
        >
          <form>
            {finishedMessage || (
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
                  onChange={newFiles => setFiles(newFiles ?? [])}
                  name="file-upload"
                  multiple={actionConfig.multiple}
                  accept={actionConfig.accept}
                />
              </>
            )}
          </form>
        </Modal>
        <ActionButton startIcon={<ImportIcon />} onClick={handleOpen}>
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
};

ImportModalComponent.defaultProps = {
  translate: text => text,
  title: null,
  queryParameters: [],
  actionConfig: {},
  subtitle: '',
  getFinishedMessage: defaultFinishedMessage, // response => React.ReactNode
  confirmButtonText: 'Import',
  cancelButtonText: 'Cancel',
  uploadButtonText: 'Choose file',
};

const mapDispatchToProps = dispatch => ({
  changeRequest: () => dispatch({ type: DATA_CHANGE_REQUEST }),
  changeSuccess: () => dispatch({ type: DATA_CHANGE_SUCCESS }),
  changeError: () => dispatch({ type: DATA_CHANGE_ERROR }),
});

export const ImportModal = connect(null, mapDispatchToProps)(ImportModalComponent);
