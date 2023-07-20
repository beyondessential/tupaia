/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef } from 'react';
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

const FileName = styled.span`
  font-size: 1rem;
  color: ${props => props.theme.palette.text.secondary};
  margin-left: 0.8rem;
`;

const FileUploadWrapper = styled.div``;
const FileUploadContainer = styled(FlexStart)``;

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
  error?: boolean;
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
  error,
}: FileUploadFieldProps) => {
  const inputEl = useRef<HTMLInputElement | null>(null);
  const text = textOnButton || `Choose file${multiple ? 's' : ''}`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newName;
    const input = inputEl.current;

    if (input?.files && input.files.length > 1) {
      newName = `${input.files.length} files selected`;
    } else {
      newName = event.target.value.split('\\').pop();
    }

    onChange(event, newName, input?.files);
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
        {fileName && <FileName>{fileName}</FileName>}
      </FileUploadContainer>
      {helperText && <MuiFormHelperText error={error}>{helperText}</MuiFormHelperText>}
    </FileUploadWrapper>
  );
};
