/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { MouseEventHandler, ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';

import { SmallAlert } from '../Alert';
import { Button, OutlinedButton } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../Dialog';
import { FileUploadField } from '../Inputs';
import { LoadingContainer } from '../LoadingContainer';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const NO_FILE_MESSAGE = 'No file chosen';

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 220px;
`;

const Heading = styled(Typography)`
  margin-bottom: 18px;
`;

interface ImportModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  actionText?: string;
  loadingText?: string;
  loadingHeading?: string;
  showLoadingContainer?: boolean;
  onSubmit: (file: File | null) => Promise<{ message?: string }>;
  onClose: () => void;
}

export const ImportModal = ({
  isOpen,
  title = 'Import',
  subtitle = '',
  actionText = 'Import',
  loadingText = 'Importing',
  loadingHeading = 'Importing data',
  showLoadingContainer = false,
  onSubmit,
  onClose,
}: ImportModalProps) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null | undefined>(null);
  const [fileName, setFileName] = useState(NO_FILE_MESSAGE);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setStatus(STATUS.LOADING);

    try {
      const { message } = await onSubmit(file || null);
      if (showLoadingContainer && message) {
        setStatus(STATUS.SUCCESS);
        setSuccessMessage(message);
      } else {
        handleClose();
      }
    } catch (error: any) {
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
    setFileName(NO_FILE_MESSAGE);
  };

  const handleDismiss = () => {
    setStatus(STATUS.IDLE);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Deselect file when dismissing an error, this avoids an error when editing selected files
    // @see https://github.com/beyondessential/tupaia-backlog/issues/1211
    setFile(null);
    setFileName(NO_FILE_MESSAGE);
  };

  const ContentContainer = showLoadingContainer
    ? ({ children }: { children: ReactNode }) => (
        <LoadingContainer heading={loadingHeading} isLoading={status === STATUS.LOADING}>
          {children}
        </LoadingContainer>
      )
    : ({ children }: { children: ReactNode }) => <>{children}</>;

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
              <FileUploadField
                onChange={(event, newName = '') => {
                  setFileName(newName);
                  setFile(event?.target?.files?.[0]);
                }}
                name="file-upload"
                fileName={fileName}
              />
            </form>
          </>
        );
    }
  }, [status, successMessage, errorMessage, subtitle, fileName]);

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
