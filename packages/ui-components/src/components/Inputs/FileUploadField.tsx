/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import MuiFormHelperText from '@material-ui/core/FormHelperText';
import { GreyButton } from '../Button';
import { FlexStart } from '../Layout';
import { SaveAlt } from '../Icons';
import { InputLabel } from './InputLabel';

const HiddenFileInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

const FileNameAndFileSize = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-left: 0.8rem;
`;

const FileUploadWrapper = styled.div``;
const FileUploadContainer = styled(FlexStart)``;

const humanFileSize = sizeInBytes => {
  const i = sizeInBytes === 0 ? 0 : Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return `${(sizeInBytes / 1024 ** i).toFixed(2) * 1} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
};

interface FileUploadFieldProps {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    fileName?: string,
    files?: FileList | null | undefined,
  ) => void;
  name: string;
  fileName: string;
  multiple: boolean;
  textOnButton: string;
  label?: string;
  tooltip?: string;
  helperText?: string;
  showFileSize?: boolean;
  maxSizeInBytes?: number;
}

export const FileUploadField = ({
  onChange = () => {},
  name,
  fileName = 'No File chosen',
  multiple = false,
  textOnButton,
  label,
  tooltip,
  helperText,
  showFileSize = false,
  maxSizeInBytes,
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
      for (const file of input.files) {
        const { size: newSizeInBytes } = file;
        if (newSizeInBytes > maxSizeInBytes) {
          setSizeInBytes(null);
          setError(
            `Error: file is too large: ${humanFileSize(newSizeInBytes)}. Max file size: ${humanFileSize(
              maxSizeInBytes,
            )}`,
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
      const [file] = input.files;
      setSizeInBytes(file.size);
      onChange(event, newName, input.files);
    }
  };

  return (
    <FileUploadWrapper as="label" htmlFor={name}>
      <InputLabel label={label} tooltip={tooltip} as="span" />
      <FileUploadContainer>
        <HiddenFileInput
          ref={inputEl}
          id={name}
          name={name}
          type="file"
          onChange={handleChange}
          value=""
          multiple={multiple}
        />
        <GreyButton component="span" startIcon={<SaveAlt />}>
          {text}
        </GreyButton>
        {fileName && <FileNameAndFileSize>{fileName} {showFileSize && humanFileSize(sizeInBytes)}</FileNameAndFileSize>}
      </FileUploadContainer>
      {error && <MuiFormHelperText error>{error}</MuiFormHelperText>}
      {helperText && <MuiFormHelperText>{helperText}</MuiFormHelperText>}
    </FileUploadWrapper>
  );
};
