import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input } from 'reactstrap';

export const JsonEditor = ({ inputKey, label, value, maxHeight, onChange }) => {
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

  const height = editorValue.split('\n').length * 27;

  return (
    <Input
      style={{ height, maxHeight }}
      type="textarea"
      value={editorValue}
      onChange={event => onChange(inputKey, event.target.value)}
    />
  );
};

JsonEditor.propTypes = {
  inputKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  maxHeight: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
