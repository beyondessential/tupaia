/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';

export const JsonEditor = ({ value, onChange }) => {
  return (
    <Editor
      value={value}
      onChange={onChange}
      ace={ace}
      theme="ace/theme/github"
      mode="code"
      mainMenuBar={false}
    />
  );
};

JsonEditor.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  onChange: PropTypes.func.isRequired,
};
