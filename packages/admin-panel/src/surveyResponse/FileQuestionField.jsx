/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import generateId from 'uuid/v1';
import { Button, Dialog, DialogFooter, DialogHeader, TextField } from '@tupaia/ui-components';
import { getUniqueFileNameParts } from '@tupaia/utils';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ExportIcon from '@material-ui/icons/GetApp';
import { FileUploadField } from '../widgets/InputField/FileUploadField';
import { IconButton, ModalContentProvider } from '../widgets';
import { useApi } from '../utilities/ApiProvider';

const Container = styled.div`
  padding-bottom: 1.2rem;
`;

const TextFieldWithActions = styled.div`
  display: flex;
  gap: 15px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const SmallIconButton = styled(IconButton)`
  scale: 0.8;
`;

const generateUniqueFileName = fileName => `${generateId()}_${fileName}`;

const DEFAULT_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const AttachModal = ({ isOpen, onClose, maxSizeInBytes, onAttachFile, title }) => {
  const [selectedFileSpec, setSelectedFileSpec] = useState({ fileName: null, file: null });

  const handleClose = () => {
    setSelectedFileSpec({ fileName: null, file: null });
    onClose();
  };

  const handleSelectFile = ({ fileName, file }) => {
    setSelectedFileSpec({ fileName, file });
  };

  const handleAttachSelectedFile = () => {
    onAttachFile(selectedFileSpec);
    setSelectedFileSpec({ fileName: null, file: null });
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={isOpen} disableBackdropClick>
      <DialogHeader onClose={handleClose} title={title} />
      <ModalContentProvider isLoading={false}>
        <FileUploadField
          label="Select a file"
          showFileSize
          maxSizeInBytes={maxSizeInBytes}
          onChange={handleSelectFile}
        />
      </ModalContentProvider>
      <DialogFooter>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button disabled={selectedFileSpec.file === null} onClick={handleAttachSelectedFile}>
          Attach
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
AttachModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maxSizeInBytes: PropTypes.number.isRequired,
  onAttachFile: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

/**
 * Similar to FileUploadField but represents managing a file e.g. A user's certificate.
 *
 * E.g. when you display the field it will show the current file and allow you to remove it or replace it,
 * rather than just allowing an arbitrary file upload like FileUploadField.
 */
export const FileQuestionField = ({ value: uniqueFileName, onChange, label, maxSizeInBytes }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewFile, setIsNewFile] = useState(false);
  const { fileName = null } = uniqueFileName ? getUniqueFileNameParts(uniqueFileName) : {};

  const handleSetFile = ({ fileName: newFileName, file }) => {
    onChange({
      uniqueFileName: generateUniqueFileName(newFileName),
      file,
    });
    setIsNewFile(true);
  };

  const handleRemoveFile = () => {
    onChange({
      uniqueFileName: null,
      file: null,
    });
  };

  const api = useApi();
  const downloadFile = async () => {
    await api.download(`downloadFiles`, { uniqueFileNames: uniqueFileName }, fileName);
  };

  return (
    <Container>
      <TextFieldWithActions>
        <TextField
          label={label}
          value={fileName}
          disabled
          key={`question-field-${uniqueFileName}`}
        />
        <Actions>
          <SmallIconButton
            disabled={!uniqueFileName || isNewFile}
            className="export-button"
            onClick={downloadFile}
          >
            <ExportIcon />
          </SmallIconButton>
          <SmallIconButton className="edit-button" onClick={() => setIsDialogOpen(true)}>
            <EditIcon />
          </SmallIconButton>
          <SmallIconButton
            disabled={!uniqueFileName}
            className="delete-button"
            onClick={handleRemoveFile}
          >
            <DeleteIcon />
          </SmallIconButton>
        </Actions>
      </TextFieldWithActions>
      <AttachModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        showFileSize
        maxSizeInBytes={maxSizeInBytes}
        onAttachFile={handleSetFile}
        title={uniqueFileName ? 'Replace file' : 'Attach file'}
      />
    </Container>
  );
};

FileQuestionField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  maxSizeInBytes: PropTypes.number,
};

FileQuestionField.defaultProps = {
  value: null,
  onChange: () => {},
  label: '',
  maxSizeInBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
};
