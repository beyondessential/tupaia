/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormLabel } from '@material-ui/core';
import { JsonEditor as Editor } from '../JsonEditor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  margin-bottom: 20px;

  > div {
    display: flex;
    flex: 1;
  }

  .jsoneditor {
    height: auto;
    border-color: ${({ theme, $invalid }) => {
      return $invalid ? theme.palette.error.main : theme.palette.text.primary;
    }};
  }
`;

const Label = styled(FormLabel)`
  font-size: 0.9rem;
  line-height: 1.1rem;
`;

export const JsonEditor = ({ inputKey, label, value, onChange, stringify, invalid, required }) => {
  if (!value) {
    return null;
  }

  let editorValue = value;

  if (typeof value === 'string') {
    editorValue = JSON.parse(value);
  }

  return (
    <Container $invalid={invalid}>
      <Label gutterBottom required={required} error={invalid}>
        {label}
      </Label>
      {/* Use json editor plugin. For configuration options @see https://github.com/vankop/jsoneditor-react */}
      <Editor
        mainMenuBar={false}
        statusBar={false}
        mode="code"
        onChange={json => onChange(inputKey, stringify ? JSON.stringify(json) : json)}
        value={editorValue}
      />
    </Container>
  );
};

JsonEditor.propTypes = {
  inputKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  stringify: PropTypes.bool,
  invalid: PropTypes.bool,
  required: PropTypes.bool,
};

JsonEditor.defaultProps = {
  value: null,
  stringify: true,
  invalid: false,
  required: false,
};
