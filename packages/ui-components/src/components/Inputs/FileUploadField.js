/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
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

export const FileUploadField = ({
  onChange,
  name,
  fileName,
  multiple,
  textOnButton,
  label,
  tooltip,
}) => {
  const inputEl = useRef(null);
  const text = textOnButton || `Choose file${multiple ? 's' : ''}`;

  const handleChange = event => {
    let newName;
    const input = inputEl.current;

    if (input.files && input.files.length > 1) {
      newName = `${input.files.length} files selected`;
    } else {
      newName = event.target.value.split('\\').pop();
    }

    onChange(event, newName);
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
    </FileUploadWrapper>
  );
};

FileUploadField.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
  fileName: PropTypes.string,
  textOnButton: PropTypes.string,
  multiple: PropTypes.bool,
  label: PropTypes.string,
  tooltip: PropTypes.string,
};

FileUploadField.defaultProps = {
  onChange: () => {},
  fileName: 'No File chosen',
  multiple: false,
  textOnButton: null,
  label: '',
  tooltip: '',
};
