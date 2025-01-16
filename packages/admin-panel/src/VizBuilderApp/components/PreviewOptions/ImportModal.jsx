import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import {
  SmallAlert,
  Button,
  OutlinedButton,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FileUploadField,
  LoadingContainer,
} from '@tupaia/ui-components';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 220px;
`;

const Heading = styled(Typography)`
  margin-bottom: 18px;
`;

export const ImportModal = ({
  isOpen,
  title,
  subtitle,
  actionText,
  loadingText,
  loadingHeading,
  showLoadingContainer,
  onSubmit,
  onClose,
}) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [file, setFile] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    setErrorMessage(null);
    setStatus(STATUS.LOADING);

    try {
      const { message } = await onSubmit(file);
      if (showLoadingContainer && message) {
        setStatus(STATUS.SUCCESS);
        setSuccessMessage(message);
      } else {
        handleClose();
      }
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  };

  const handleClose = async () => {
    onClose();

    setStatus(STATUS.IDLE);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFile(null);
  };

  const handleDismiss = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Deselect file when dismissing an error, this avoids an error when editing selected files
    // @see https://github.com/beyondessential/tupaia-backlog/issues/1211
    setFile(null);
  };

  const ContentContainer = showLoadingContainer
    ? ({ children }) => (
        <LoadingContainer heading={loadingHeading} isLoading={status === STATUS.LOADING}>
          {children}
        </LoadingContainer>
      )
    : React.Fragment;

  const renderContent = useCallback(() => {
    switch (status) {
      case STATUS.SUCCESS:
        return <p>{successMessage}</p>;
      case STATUS.ERROR:
        return (
          <>
            <Heading variant="h6">An error has occurred.</Heading>
            <SmallAlert severity="error" variant="standard">
              {errorMessage}
            </SmallAlert>
          </>
        );
      default:
        return (
          <>
            <p>{subtitle}</p>
            <form>
              <FileUploadField onChange={files => setFile(files[0])} name="file-upload" />
            </form>
          </>
        );
    }
  }, [status, successMessage, errorMessage, subtitle]);

  const renderButtons = useCallback(() => {
    switch (status) {
      case STATUS.SUCCESS:
        return <Button onClick={handleClose}>Done</Button>;
      case STATUS.ERROR:
        return (
          <>
            <OutlinedButton onClick={handleDismiss}>Dismiss</OutlinedButton>
            <Button disabled>{actionText}</Button>
          </>
        );
      default:
        return (
          <>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file}
              isLoading={status === STATUS.LOADING}
              loadingText={loadingText}
              onClick={handleSubmit}
            >
              {actionText}
            </Button>
          </>
        );
    }
  }, [status, file, handleDismiss, handleClose, handleSubmit]);

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <DialogHeader
        onClose={handleClose}
        title={errorMessage ? 'Error' : title}
        color={errorMessage ? 'error' : 'textPrimary'}
      />
      <ContentContainer>
        <Content>{renderContent()}</Content>
      </ContentContainer>
      <DialogFooter>{renderButtons()}</DialogFooter>
    </Dialog>
  );
};

ImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actionText: PropTypes.string,
  loadingText: PropTypes.string,
  loadingHeading: PropTypes.string,
  showLoadingContainer: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ImportModal.defaultProps = {
  title: 'Import',
  subtitle: '',
  actionText: 'Import',
  loadingText: 'Importing',
  loadingHeading: 'Importing data',
  showLoadingContainer: false,
};
