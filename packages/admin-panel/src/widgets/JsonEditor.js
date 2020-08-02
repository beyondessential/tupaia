/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField } from '@tupaia/ui-components';
import PropTypes from 'prop-types';

export const JsonEditor = ({ inputKey, label, secondaryLabel, value, onChange }) => {
  let editorValue = '';

  switch (typeof value) {
    case 'object':
      editorValue = JSON.stringify(value, null, 2);
      break;
    case 'string':
      try {
        const object = JSON.parse(value);
        editorValue = JSON.stringify(object, null, 2);
      } catch (e) {
        editorValue = value;
      }
      break;
    default:
      editorValue = value.toString();
  }

  const rows = editorValue.split('\n').length;

  return (
    <TextField
      label={label}
      helperText={secondaryLabel}
      rows={rows < 8 ? rows : 8}
      type="textarea"
      multiline
      value={editorValue}
      onChange={event => onChange(inputKey, event.target.value)}
    />
  );
};

JsonEditor.propTypes = {
  inputKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  secondaryLabel: PropTypes.string,
};

JsonEditor.defaultProps = {
  secondaryLabel: null,
  value: null,
};
