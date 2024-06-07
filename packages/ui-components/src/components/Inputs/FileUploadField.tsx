/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { FormHelperText, useTheme } from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { FilePicker } from '../Icons';
import { InputLabel } from './InputLabel';

const LabelAndTooltip = styled.div`
  align-items: center;
  display: flex;
  margin-block-end: 0.25rem;
`;

const Uploader = styled.div`
  border-radius: 0.1875rem;
  border: 0.0625rem dashed ${({ theme }) => theme.palette.grey['400']};
`;

const Drpozone = styled.div<{ $isDragActive: boolean; $isDragReject: boolean }>`
  cursor: pointer;
  flex-direction: column;
  inline-size: 100%;
  padding: 1.25rem;
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
  border-block-start: 0.0625rem dashed ${({ theme }) => theme.palette.grey['400']};
  color: ${({ theme }) => theme.palette.grey['600']};
  list-style-type: none;
  margin: 0;
  padding-block: 0.5rem;
  padding-inline: 1.25rem;

  /*
   * Workaround for accessibility issue with VoiceOver.
   * See https://gerardkcohen.me/writing/2017/voiceover-list-style-type.html
   */
  li::before {
    content: '\\200B'; /* zero-width space */
  }
`;

const FileMetadata = styled.li`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

// const RemoveButton = styled(Button).attrs({
//   variant: 'text',
//   color: 'default',
// })`
//   font-weight: 400;
//   margin-inline-start: 0.8rem;
//   padding: 0;
//   text-decoration: underline;
//   .MuiButton-label {
//     font-size: 0.6875rem;
//   }
// `;

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
  name: string;
  fileName: string;
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
  name,
  fileName,
  multiple = false,
  label,
  tooltip,
  helperText,
  maxSizeInBytes,
  FormHelperTextComponent = 'p',
  required = false,
  accept,
}: FileUploadFieldProps) => {
  const {
    acceptedFiles,
    fileRejections,
    getInputProps,
    getRootProps,
    isDragAccept,
    isDragActive,
    isDragReject,
  } = useDropzone({
    maxSize: maxSizeInBytes,
    multiple,
  });
  const { palette } = useTheme();

  const fileOrFiles = multiple ? 'files' : 'file';
  const acceptedFileTypesLabel = accept?.split(',').join(' ') ?? 'any';
  const getDropzoneLabel = () => {
    if (isDragReject) return 'File not allowed';
    if (isDragActive) return `Drop ${fileOrFiles} here`;
    return (
      <>
        Drag & drop or <ChooseFileButton>choose {fileOrFiles}</ChooseFileButton> to upload
      </>
    );
  };

  return (
    <>
      <LabelAndTooltip>
        <InputLabel label={label} tooltip={tooltip} />
      </LabelAndTooltip>
      <Uploader>
        <Drpozone {...getRootProps()} $isDragActive={isDragActive} $isDragReject={isDragReject}>
          <input {...getInputProps()} accept={accept} name={namd} id={name} required={required} />
          <FilePicker color={palette.primary.main} />
          <PrimaryLabel>{getDropzoneLabel()}</PrimaryLabel>
          <SecondaryLabel>Supported file types: {acceptedFileTypesLabel}</SecondaryLabel>
        </Drpozone>
        {acceptedFiles.length > 0 && (
          <SelectedFileList>
            {acceptedFiles.map(file => (
              <FileMetadata key={file.name}>
                {file.name} ({humanFileSize(file.size)})
              </FileMetadata>
            ))}
          </SelectedFileList>
        )}
      </Uploader>
      {fileRejections.map(({ file, errors }) =>
        errors.map(error => (
          <FormHelperText error key={`${file.name}-${error.code}`}>
            ‘{file.name}’ not allowed &ndash; {error.message}
          </FormHelperText>
        )),
      )}
      {helperText && (
        <FormHelperText component={FormHelperTextComponent}>{helperText}</FormHelperText>
      )}
      {/*<RemoveButton onClick={clear}>Clear selection</RemoveButton>*/}
    </>
  );
};
