/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 20px;
`;

const Label = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.9rem;
  line-height: 1.1rem;
`;

const HelperText = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;
  margin-top: 3px;
  line-height: 1.66;
`;

export const JsonEditor = ({ inputKey, label, secondaryLabel, value, onChange, stringify }) => {
  if (!value) {
    return null;
  }

  let editorValue = value;

  if (typeof value === 'string') {
    editorValue = JSON.parse(value);
  }

  return (
    <Container>
      <Label gutterBottom>{label}</Label>
      {/* Use json editor plugin. For configuration options @see https://github.com/vankop/jsoneditor-react */}
      <Editor
        history
        value={editorValue}
        onChange={json => onChange(inputKey, stringify ? JSON.stringify(json) : json)}
      />
      {secondaryLabel && <HelperText>{secondaryLabel}</HelperText>}
    </Container>
  );
};

JsonEditor.propTypes = {
  inputKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  secondaryLabel: PropTypes.string,
  stringify: PropTypes.bool,
};

JsonEditor.defaultProps = {
  secondaryLabel: null,
  value: null,
  stringify: true,
};
