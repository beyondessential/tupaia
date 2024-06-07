/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import { FormLabel } from '@material-ui/core';
import styled from 'styled-components';
import MuiFormHelperText from '@material-ui/core/FormHelperText';
import { Button } from '../Button';
import { FlexStart } from '../Layout';
import { FilePicker } from '../Icons';
import { InputLabel } from './InputLabel';

const HiddenFileInput = styled.input`
  display: none; // Hide the input element without applying other styles - setting it to be small and position absolute causes the form to crash when the input is clicked
`;

const FileNameAndFileSize = styled.span`
  font-size: ${props => props.theme.typography.body2.fontSize};
`;

const FileUploadContainer = styled(FlexStart)`
  span + & {
    margin-block-start: 1rem;
  }
`;

const RemoveButton = styled(Button).attrs({
  variant: 'text',
  color: 'default',
})`
  font-weight: 400;
  text-decoration: underline;
  padding: 0;
  margin-left: 0.8rem;
  .MuiButton-label {
    font-size: 0.7rem;
  }
`;

const humanFileSize = (sizeInBytes: number) => {
  const i = sizeInBytes === 0 ? 0 : Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return `${(sizeInBytes / 1024 ** i).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
};

interface FileUploadFieldProps {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | null,
    fileName?: string,
    files?: FileList | null | undefined,
  ) => void;
  name: string;
  fileName: string;
  multiple?: boolean;
  textOnButton?: string;
  label?: string;
  tooltip?: string;
  helperText?: string;
  showFileSize?: boolean;
  maxSizeInBytes?: number;
  FormHelperTextComponent?: React.ElementType;
  required?: boolean;
  buttonVariant?: 'text' | 'outlined' | 'contained';
  accept?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  buttonColor?: 'primary' | 'secondary' | 'default';
}

export const FileUploadField = ({
  onChange = () => {},
  name,
  fileName,
  multiple = false,
  textOnButton,
  label,
  tooltip,
  helperText,
  showFileSize = false,
  maxSizeInBytes,
  FormHelperTextComponent = 'p',
  required,
  buttonVariant = 'contained',
  accept = '*',
  ariaLabelledBy,
  ariaDescribedBy,
}: FileUploadFieldProps) => {
  const inputEl = useRef<HTMLInputElement | null>(null);
  const text = textOnButton || `Choose file${multiple ? 's' : ''}`;

  const [error, setError] = useState<string | null>(null);
  const [sizeInBytes, setSizeInBytes] = useState<number | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newName;
    const input = inputEl.current;

    if (!input || !input.files) return;

    if (input.files.length > 1) {
      newName = `${input.files.length} files selected`;
    } else {
      newName = event.target.value.split('\\').pop();
    }

    if (maxSizeInBytes) {
      for (const file of Array.from(input.files)) {
        const { size: newSizeInBytes } = file;
        if (newSizeInBytes > maxSizeInBytes) {
          setSizeInBytes(null);
          setError(
            `Error: file is too large: ${humanFileSize(
              newSizeInBytes,
            )}. Max file size: ${humanFileSize(maxSizeInBytes)}`,
          );
          onChange(event, undefined, null);
          return;
        }
      }
    }

    if (multiple) {
      onChange(event, newName, input.files);
      // We don't support file size label if multiple
    } else {
      const [file] = Array.from(input.files);
      setSizeInBytes(file.size);
      onChange(event, newName, input.files);
    }
    setError(null);
  };

  const removeFile = () => {
    const input = inputEl.current;
    if (input) {
      input.value = '';
      onChange(null);
      setSizeInBytes(null);
    }
  };

  return (
    <>
      <FormLabel htmlFor={name}>
        {label && <InputLabel label={label} tooltip={tooltip} as="span" />}
        <FileUploadContainer>
          <HiddenFileInput
            ref={inputEl}
            id={name}
            name={name}
            type="file"
            onChange={handleChange}
            value=""
            multiple={multiple}
            required={required}
            accept={accept}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
          />

          {!fileName && (
            <Button component="span" startIcon={<FilePicker />} variant={buttonVariant}>
              {text}
            </Button>
          )}
        </FileUploadContainer>

        {error && <MuiFormHelperText error>{error}</MuiFormHelperText>}
        {helperText && (
          <MuiFormHelperText component={FormHelperTextComponent}>{helperText}</MuiFormHelperText>
        )}
      </FormLabel>
      {fileName && (
        <FileNameAndFileSize>
          {fileName} {showFileSize && sizeInBytes && `(${humanFileSize(sizeInBytes)})`}
          <RemoveButton onClick={removeFile}>Remove</RemoveButton>
        </FileNameAndFileSize>
      )}
    </>
  );
};
