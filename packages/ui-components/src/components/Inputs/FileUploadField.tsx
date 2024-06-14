/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { FormHelperText, useTheme } from '@material-ui/core';
import { DropEvent, useDropzone } from 'react-dropzone';
import { FilePicker } from '../Icons';
import { Button } from '../Button';
import { InputLabel } from './InputLabel';

const LabelAndTooltip = styled.div`
  align-items: center;
  display: flex;
  margin-block-end: 0.25rem;
`;

const Uploader = styled.div`
  border-radius: 0.1875rem;
  border: 0.0625rem dashed ${({ theme }) => theme.palette.grey['400']};
  > * {
    padding-block: 0.875rem;
    padding-inline: 1.1rem;
  }
`;

const Dropzone = styled.div<{ $isDragActive: boolean; $isDragReject: boolean }>`
  cursor: pointer;
  flex-direction: column;
  inline-size: 100%;
  text-align: center;
  transition: background-color 100ms ease;

  :hover,
  :active,
  :focus-visible {
    background-color: #f4f9ff;
  }

  ${({ $isDragActive, $isDragReject }) => {
    if ($isDragReject)
      return css`
        background-color: #fff6f5;
      `;

    if ($isDragActive)
      return css`
        background-color: #f4f9ff;
      `;
  }}
`;

const PrimaryLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  font-weight: 500;
`;

const SecondaryLabel = styled.p`
  color: ${({ theme }) => theme.palette.grey['600']};
  font-size: 0.6875rem;
  font-weight: 400;
  letter-spacing: 0.02em;
`;

const ChooseFileButton = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  &:hover {
    text-decoration: underline;
  }
`;

const SelectedFileList = styled.ul`
  list-style-type: none;
  margin: 0;

  /*
   * Workaround for accessibility issue with VoiceOver.
   * See https://gerardkcohen.me/writing/2017/voiceover-list-style-type.html
   */
  li::before {
    content: '\\200B'; /* zero-width space */
  }
`;

const SelectedFileListItem = styled.li`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  line-height: 1.2rem; // Match .MuiInputBase-input
`;

const ClearButton = styled(Button).attrs({
  variant: 'text',
  color: 'default',
})`
  font-weight: 400;
  margin-block: 0.25rem;
  padding-inline: 1.1rem;
  text-decoration: underline;
  transition: color 150ms ease;
  .MuiButton-label {
    font-size: 0.6875rem;
  }
  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.palette.primary.main};
    text-decoration: underline;
  }
`;

const humanFileSize = (sizeInBytes: number) => {
  const i = sizeInBytes === 0 ? 0 : Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  const value = (sizeInBytes / 1024 ** i).toFixed(2);
  const unit = ['B', 'kB', 'MB', 'GB', 'TB'][i];
  return (
    <>
      {value}&nbsp;{unit}
    </>
  );
};

interface FileUploadFieldProps {
  onChange: (
    files: File[] | FileList | null,
    event: React.ChangeEvent<HTMLInputElement> | null,
  ) => void;
  name: string;
  multiple?: boolean;
  label?: string;
  tooltip?: string;
  helperText?: string;
  maxSizeInBytes?: number;
  FormHelperTextComponent?: React.ElementType;
  required?: boolean;
  accept?: string;
}

export const FileUploadField = ({
  onChange,
  FormHelperTextComponent = 'p',
  accept,
  helperText,
  label,
  maxSizeInBytes,
  multiple = false,
  name,
  required = false,
  tooltip,
}: FileUploadFieldProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const hasFileSelected = files.length > 0;
  const onDropAccepted = (acceptedFiles: File[], event: DropEvent) => {
    setFiles(acceptedFiles);
    onChange(acceptedFiles, event as React.ChangeEvent<HTMLInputElement>);
  };
  const { fileRejections, getInputProps, getRootProps, inputRef, isDragActive, isDragReject } =
    useDropzone({
      maxSize: maxSizeInBytes,
      multiple,
      onDropAccepted,
    });
  const { palette } = useTheme();

  const clearSelection = () => {
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = '';
      onChange(files, null);
    }
  };

  const fileOrFiles = multiple ? 'files' : 'file';
  const getDropzoneLabel = () => {
    if (isDragReject) return 'File(s) not allowed';
    if (isDragActive) return `Drop ${fileOrFiles} here`;
    return (
      <>
        Drag & drop or <ChooseFileButton>choose {fileOrFiles}</ChooseFileButton> to upload
      </>
    );
  };

  const acceptedFileTypesLabel =
    accept
      ?.split(',')
      .map(str => str.trim())
      .join(' ') ?? 'any';

  return (
    <>
      <LabelAndTooltip>
        <InputLabel label={label} tooltip={tooltip} />
      </LabelAndTooltip>
      <Uploader>
        {!hasFileSelected && (
          <Dropzone {...getRootProps()} $isDragActive={isDragActive} $isDragReject={isDragReject}>
            <input {...getInputProps()} accept={accept} id={name} name={name} required={required} />
            <FilePicker color={palette.primary.main} />
            <PrimaryLabel>{getDropzoneLabel()}</PrimaryLabel>
            <SecondaryLabel>Supported file types: {acceptedFileTypesLabel}</SecondaryLabel>
          </Dropzone>
        )}
        {hasFileSelected && (
          <SelectedFileList>
            {files.map(file => (
              <SelectedFileListItem key={file.name}>
                {file.name} ({humanFileSize(file.size)})
              </SelectedFileListItem>
            ))}
          </SelectedFileList>
        )}
      </Uploader>
      {fileRejections.map(({ file, errors }) =>
        errors.map(error => (
          <>
            <FormHelperText error key={`${file.name}-${error.code}`}>
              ‘{file.name}’ not allowed &ndash; {error.message}
            </FormHelperText>
          </>
        )),
      )}
      {hasFileSelected && <ClearButton onClick={clearSelection}>Clear selection</ClearButton>}
      {helperText && (
        <FormHelperText component={FormHelperTextComponent}>{helperText}</FormHelperText>
      )}
    </>
  );
};
