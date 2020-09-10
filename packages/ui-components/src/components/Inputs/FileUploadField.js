/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GreyButton } from '../Button';
import { FlexStart } from '../Layout';
import { SaveAlt } from '../Icons';

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

export const FileUploadField = ({ onChange, name }) => {
  const inputEl = useRef(null);
  const [fileName, setFileName] = useState('No File chosen');

  const handleChange = event => {
    let newName;
    const input = inputEl.current;

    if (input.files && input.files.length > 1) {
      newName = `${input.files.length} files selected`;
    } else {
      newName = event.target.value.split('\\').pop();
    }

    setFileName(newName);
    onChange(event);
  };

  return (
    <FlexStart as="label" htmlFor={name}>
      <HiddenFileInput ref={inputEl} id={name} name={name} type="file" onChange={handleChange} />
      <GreyButton component="span" startIcon={<SaveAlt />}>
        Choose file
      </GreyButton>
      {fileName && <FileName>{fileName}</FileName>}
    </FlexStart>
  );
};

FileUploadField.propTypes = {
  onChange: PropTypes.func,
  name: PropTypes.string.isRequired,
};

FileUploadField.defaultProps = {
  onChange: () => {},
};
