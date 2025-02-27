import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { FormHelperText, useTheme } from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { FilePicker as FilePickerIcon } from '../Icons';
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
  padding-block-start: 1.25rem;
  text-align: center;
  transition: background-color 100ms ease;

  :hover,
  :active,
  :focus-visible {
    background-color: #f4f9ff;
  }

  ${({ $isDragActive }) => {
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
  letter-spacing: 0.03333em;
`;

const ChooseFileButton = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  &:hover {
    text-decoration: underline;
  }
`;

const SelectedFileList = styled.ul<{ $doesNeedBorder: boolean }>`
  list-style-type: none;
  margin: 0;

  /*
   * Workaround for accessibility issue with VoiceOver.
   * See https://gerardkcohen.me/writing/2017/voiceover-list-style-type.html
   */
  li::before {
    content: '\\200B'; /* zero-width space */
  }

  // If top border is always shown, it collides with the top-border of the parent when file
  // dropzone is hidden
  ${({ $doesNeedBorder }) =>
    $doesNeedBorder &&
    css`
      border-block-start: 0.0625rem dashed ${({ theme }) => theme.palette.grey['400']};
    `}
`;

const SelectedFileListItem = styled.li`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  line-height: 1.2rem; // Match .MuiInputBase-input
`;

const RemoveButton = styled(Button).attrs({
  variant: 'text',
  color: 'default',
})`
  display: inline-block;
  font-weight: 400;
  margin-block: 0;
  padding-block: 0;
  padding-inline: 1.1rem;
  transition: color 100ms ease;
  .MuiButton-label {
    text-decoration: underline;
    font-size: 0.6875rem;
  }
  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const humanFileSize = (sizeInBytes: number) => {
  const i = sizeInBytes === 0 ? 0 : Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  const valueAsFloat = (sizeInBytes / 1024 ** i).toFixed(2);
  const unit = ['B', 'kB', 'MB', 'GB', 'TB'][i];
  const value = unit === 'B' ? sizeInBytes : valueAsFloat;

  return (
    <>
      {value}&nbsp;{unit}
    </>
  );
};

export interface FileUploadFieldProps {
  /**
   * The parent of {@link FileUploadField} manages state for which files are staged to be uploaded.
   * This change handler propagates state changes in the {@link FileUploadField} to its parent.
   */
  onChange: (files: File[] | FileList | null) => void;
  name: string;
  /**
   * In some places, such as DataTrak’s survey review screen, we use a read-only (disabled) version
   * of the {@link FileUploadField} with a “pre-selected“ file. Since `<input>`’s value cannot be
   * programmatically set (except to ''), we simply show a filename so it appears as if a file is
   * selected.
   */
  fileName?: string;
  multiple?: boolean;
  label?: string;
  dropzoneLabel?: string;
  tooltip?: string;
  helperText?: string;
  maxSizeInBytes?: number;
  FormHelperTextComponent?: React.ElementType;
  required?: boolean;
  accept?: Record<string, string[]>;
  /**
   * Puts this component in a read-only mode. This hides the dropzone entirely. Use this prop in
   * tandem with the `fileName` prop to programmatically show a `FileUploadField` that looks like it
   * has a file selected.
   */
  disabled?: boolean;
  initialFiles?: File[];
}

export const FileUploadField = ({
  onChange,
  FormHelperTextComponent = 'p',
  accept,
  helperText,
  label,
  dropzoneLabel,
  maxSizeInBytes,
  multiple = false,
  name,
  required = false,
  tooltip,
  disabled = false,
  fileName,
  initialFiles = [],
}: FileUploadFieldProps) => {
  if (disabled)
    return (
      <Uploader>
        <SelectedFileList $doesNeedBorder={false}>
          <SelectedFileListItem>
            {fileName ?? <em>File uploader disabled</em>}
            <RemoveButton disabled>Remove</RemoveButton>
          </SelectedFileListItem>
        </SelectedFileList>
      </Uploader>
    );

  /**
   * `useDropzone` can provide an `acceptedFiles` array, but it provides no way to programmatically
   * add/remove elements. We manage file selection state manually for some custom behaviour:
   *
   *   1. dropping files ADDS to the selection (rather than replacing it); and
   *   2. files may be removed individually from the selection.
   *
   * This array uses set semantics. See {@link onDropAccepted}.
   */
  const [files, setFiles] = useState<File[]>(initialFiles);
  const hasFileSelected = files.length > 0;

  /**
   * Unions the newly selected files with the existing selection.
   *
   * @privateRemarks Cannot rely on `file.name` as a unique identifier, because it is only the
   * basename. The user may select two files with the same basename from different folders.
   * Duplicate detection in this function stringifies the whole `File` object because it is unlikely
   * that two different files will have the same name, size AND last-modified date.
   *
   * @param acceptedFiles The newly selected files, provided by `react-dropzone`
   */
  const onDropAccepted = (acceptedFiles: File[]) => {
    const deduped = acceptedFiles.filter(
      acceptedFile =>
        !files.map(file => JSON.stringify(file)).includes(JSON.stringify(acceptedFile)),
    );
    const newFiles = files.concat(deduped);
    setFiles(newFiles);
  };

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter(file => JSON.stringify(file) !== JSON.stringify(fileToRemove));
    setFiles(newFiles);
  };

  /** Propagates file selection changes to parent */
  useEffect(() => {
    // if the files are the same as the initial files, don't call onChange
    if (
      initialFiles.length &&
      files.length &&
      files.every((file, i) => initialFiles?.[i]?.name === file.name)
    )
      return;
    onChange(files);
  }, [files]);

  const { fileRejections, getInputProps, getRootProps, isDragActive } = useDropzone({
    // Explicitly fall back to undefined, because null causes TypeError in Chromium
    accept: accept ?? undefined,
    disabled,
    maxSize: maxSizeInBytes,
    multiple,
    onDropAccepted,
  });

  const { palette } = useTheme();

  const fileOrFiles = multiple ? 'files' : 'file';
  const getDropzoneLabel = () => {
    if (isDragActive) return `Drop ${fileOrFiles} here`;
    if (dropzoneLabel) return dropzoneLabel;
    return (
      <>
        Drag & drop or <ChooseFileButton>choose {fileOrFiles}</ChooseFileButton> to upload
      </>
    );
  };

  const acceptedFileExtensions = accept
    ? Object.values(accept)
        .flat()
        .map(str => str.trim())
    : null;
  const acceptedFileTypesLabel = acceptedFileExtensions?.join(' ') ?? 'any';

  return (
    <>
      <LabelAndTooltip>
        <InputLabel label={label} tooltip={tooltip} />
      </LabelAndTooltip>
      <Uploader>
        {(!hasFileSelected || multiple) && (
          <Dropzone {...getRootProps()} $isDragActive={isDragActive}>
            <input {...getInputProps()} id={name} name={name} required={required} />
            <FilePickerIcon color={palette.primary.main} />
            <PrimaryLabel>{getDropzoneLabel()}</PrimaryLabel>
            <SecondaryLabel>Supported file types: {acceptedFileTypesLabel}</SecondaryLabel>
          </Dropzone>
        )}
        {hasFileSelected && (
          <SelectedFileList $doesNeedBorder={multiple}>
            {files.map(file => (
              <SelectedFileListItem key={file.name}>
                {file.name} ({humanFileSize(file.size)})
                <RemoveButton onClick={() => removeFile(file)}>Remove</RemoveButton>
              </SelectedFileListItem>
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
    </>
  );
};
